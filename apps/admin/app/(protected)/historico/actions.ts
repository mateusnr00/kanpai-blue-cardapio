"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { tags } from "@/lib/cache-tags";
import { revalidateMenuOnSite } from "@/lib/trigger-site-revalidate";
import { logAudit } from "@/lib/audit";

export type DuplicateResult =
  | { error: string }
  | { ok: true; unitName: string; name: string; count?: number };

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || `prato-${Date.now()}`
  );
}

function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

type Supa = ReturnType<typeof createServerClient>;

/** Garante slug único dentro da unidade (constraint dishes_restaurant_slug_uk). */
async function uniqueDishSlug(supabase: Supa, restaurantId: string, base: string): Promise<string> {
  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const { data } = await supabase
      .from("dishes")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Resolve a "outra unidade" a partir da unidade de origem. Como o restaurante
 * tem 2 unidades ativas, a outra é a única ativa com id diferente. Retorna null
 * se não houver exatamente uma (0 ou ambíguo).
 */
async function otherUnit(supabase: Supa, sourceRestaurantId: string): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase
    .from("restaurants")
    .select("id, short_name, active")
    .neq("id", sourceRestaurantId)
    .eq("active", true);
  const list = data ?? [];
  if (list.length !== 1) return null;
  return { id: list[0].id, name: list[0].short_name };
}

const DISH_COPY_FIELDS =
  "id, name, description, price, original_price, unit, subcategory, featured, featured_label, badges, image_path, blur_data_url, is_component_only, component_labels, schedule_start, schedule_end, schedule_off_days, category_id, restaurant_id";

type DishRow = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  original_price: string | null;
  unit: string | null;
  subcategory: string | null;
  featured: boolean;
  featured_label: string | null;
  badges: string[] | null;
  image_path: string | null;
  blur_data_url: string | null;
  is_component_only: boolean;
  component_labels: Record<string, string> | null;
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_off_days: number[] | null;
  category_id: string;
  restaurant_id: string;
};

/** Insere uma cópia do prato (sem componentes) na unidade/categoria destino. Copia variantes. */
async function copyDishRow(
  supabase: Supa,
  src: DishRow,
  targetUnitId: string,
  targetCategoryId: string,
): Promise<string | null> {
  const slug = await uniqueDishSlug(supabase, targetUnitId, slugify(src.name));
  const { data: maxRow } = await supabase
    .from("dishes")
    .select("position")
    .eq("category_id", targetCategoryId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: inserted, error } = await supabase
    .from("dishes")
    .insert({
      slug,
      category_id: targetCategoryId,
      restaurant_id: targetUnitId,
      name: src.name,
      description: src.description,
      price: src.price,
      original_price: src.original_price,
      unit: src.unit,
      subcategory: src.subcategory,
      featured: src.featured,
      featured_label: src.featured_label,
      badges: src.badges ?? [],
      image_path: src.image_path,
      blur_data_url: src.blur_data_url,
      is_component_only: src.is_component_only,
      component_labels: src.component_labels ?? {},
      active: true,
      position: (maxRow?.position ?? -1) + 1,
      schedule_start: src.schedule_start,
      schedule_end: src.schedule_end,
      schedule_off_days: src.schedule_off_days ?? [],
    })
    .select("id")
    .single();
  if (error || !inserted) return null;

  const { data: vars } = await supabase
    .from("dish_variants")
    .select("name, price, image_path, position")
    .eq("dish_id", src.id)
    .order("position");
  if (vars && vars.length > 0) {
    await supabase.from("dish_variants").insert(
      vars.map((v) => ({
        dish_id: inserted.id,
        name: v.name,
        price: v.price,
        image_path: v.image_path,
        position: v.position,
      })),
    );
  }
  return inserted.id;
}

/**
 * Garante que o prato-filho (componente) exista na unidade destino. Se já houver
 * um com o mesmo nome (em qualquer categoria), reaproveita; senão copia, na
 * categoria de mesmo slug (ou na categoria do pai, como fallback).
 * cache mapeia id-de-origem -> id-no-destino pra não copiar duas vezes.
 */
async function findOrCopyChild(
  supabase: Supa,
  childId: string,
  targetUnitId: string,
  fallbackCategoryId: string,
  cache: Map<string, string>,
): Promise<string | null> {
  const cached = cache.get(childId);
  if (cached) return cached;

  const { data: child } = await supabase
    .from("dishes")
    .select(`${DISH_COPY_FIELDS}, category:categories!dishes_category_id_fkey(slug)`)
    .eq("id", childId)
    .maybeSingle();
  if (!child) return null;

  const { data: targetExisting } = await supabase
    .from("dishes")
    .select("id, name")
    .eq("restaurant_id", targetUnitId);
  const match = (targetExisting ?? []).find((d) => normName(d.name) === normName(child.name));
  if (match) {
    cache.set(childId, match.id);
    return match.id;
  }

  const childCat = (child as { category?: { slug: string } | { slug: string }[] }).category;
  const childCatSlug = Array.isArray(childCat) ? childCat[0]?.slug : childCat?.slug;
  let targetCat = fallbackCategoryId;
  if (childCatSlug) {
    const { data: tc } = await supabase
      .from("categories")
      .select("id")
      .eq("restaurant_id", targetUnitId)
      .eq("slug", childCatSlug)
      .maybeSingle();
    if (tc) targetCat = tc.id;
  }
  const newId = await copyDishRow(supabase, child as DishRow, targetUnitId, targetCat);
  if (newId) cache.set(childId, newId);
  return newId;
}

/** Copia o prato + seus componentes (resolvendo cada filho na unidade destino). */
async function copyDishWithComponents(
  supabase: Supa,
  src: DishRow,
  targetUnitId: string,
  targetCategoryId: string,
  cache: Map<string, string>,
): Promise<string | null> {
  const newId = await copyDishRow(supabase, src, targetUnitId, targetCategoryId);
  if (!newId) return null;
  cache.set(src.id, newId);

  const { data: comps } = await supabase
    .from("dish_components")
    .select("child_dish_id, kind, position")
    .eq("parent_dish_id", src.id)
    .order("kind")
    .order("position");
  if (comps && comps.length > 0) {
    const rows: Array<{ parent_dish_id: string; child_dish_id: string; kind: string; position: number }> = [];
    for (const c of comps) {
      const childTargetId = await findOrCopyChild(supabase, c.child_dish_id, targetUnitId, targetCategoryId, cache);
      if (childTargetId) {
        rows.push({ parent_dish_id: newId, child_dish_id: childTargetId, kind: c.kind, position: c.position });
      }
    }
    if (rows.length > 0) await supabase.from("dish_components").insert(rows);
  }
  return newId;
}

/** Duplica um prato na OUTRA unidade, na categoria de mesmo slug. */
export async function duplicateDishToOtherUnit(dishId: string): Promise<DuplicateResult> {
  const supabase = createServerClient();
  const { data: src } = await supabase
    .from("dishes")
    .select(`${DISH_COPY_FIELDS}, category:categories!dishes_category_id_fkey(slug, name)`)
    .eq("id", dishId)
    .maybeSingle();
  if (!src) return { error: "Prato não encontrado (pode ter sido excluído)." };

  const other = await otherUnit(supabase, src.restaurant_id);
  if (!other) return { error: "Não consegui identificar a outra unidade." };

  const cat = (src as { category?: { slug: string; name: string } | { slug: string; name: string }[] }).category;
  const catSlug = Array.isArray(cat) ? cat[0]?.slug : cat?.slug;
  const catName = Array.isArray(cat) ? cat[0]?.name : cat?.name;
  if (!catSlug) return { error: "Categoria de origem inválida." };

  const { data: targetCat } = await supabase
    .from("categories")
    .select("id")
    .eq("restaurant_id", other.id)
    .eq("slug", catSlug)
    .maybeSingle();
  if (!targetCat) {
    return {
      error: `A categoria "${catName ?? catSlug}" não existe no ${other.name}. Duplique a categoria primeiro.`,
    };
  }

  const cache = new Map<string, string>();
  const newId = await copyDishWithComponents(supabase, src as DishRow, other.id, targetCat.id, cache);
  if (!newId) return { error: "Falha ao duplicar o prato." };

  await logAudit({
    action: "create",
    entityType: "dish",
    entityId: newId,
    entityLabel: src.name,
    restaurantId: other.id,
    details: { duplicated_from: dishId, from_unit: src.restaurant_id },
  });
  revalidatePath("/");
  revalidateTag(tags.menu(other.id));
  revalidateMenuOnSite(other.id);
  return { ok: true, unitName: other.name, name: src.name };
}

const CATEGORY_COPY_FIELDS =
  "id, slug, number, name, short_name, description, item_count, detail, gradient, featured, full_width, display_mode, parent_id, subcategories, subcategory_display_modes, image_path, slideshow_image_paths, schedule_start, schedule_end, schedule_off_days, restaurant_id";

/** Duplica a categoria inteira (com os pratos) na OUTRA unidade. */
export async function duplicateCategoryToOtherUnit(categoryId: string): Promise<DuplicateResult> {
  const supabase = createServerClient();
  const { data: cat } = await supabase
    .from("categories")
    .select(CATEGORY_COPY_FIELDS)
    .eq("id", categoryId)
    .maybeSingle();
  if (!cat) return { error: "Categoria não encontrada (pode ter sido excluída)." };

  const other = await otherUnit(supabase, cat.restaurant_id);
  if (!other) return { error: "Não consegui identificar a outra unidade." };

  // Acha (ou cria) a categoria de mesmo slug na unidade destino.
  let targetCatId: string;
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("restaurant_id", other.id)
    .eq("slug", cat.slug)
    .maybeSingle();
  if (existing) {
    targetCatId = existing.id;
  } else {
    let targetParentId: string | null = null;
    if (cat.parent_id) {
      const { data: p } = await supabase.from("categories").select("slug").eq("id", cat.parent_id).maybeSingle();
      if (p?.slug) {
        const { data: tp } = await supabase
          .from("categories")
          .select("id")
          .eq("restaurant_id", other.id)
          .eq("slug", p.slug)
          .maybeSingle();
        targetParentId = tp?.id ?? null;
      }
    }
    const { data: maxRow } = await supabase
      .from("categories")
      .select("position")
      .eq("restaurant_id", other.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: copy, error } = await supabase
      .from("categories")
      .insert({
        slug: cat.slug,
        restaurant_id: other.id,
        number: cat.number,
        name: cat.name,
        short_name: cat.short_name,
        description: cat.description,
        item_count: cat.item_count,
        detail: cat.detail,
        gradient: cat.gradient,
        featured: cat.featured,
        full_width: cat.full_width,
        display_mode: cat.display_mode,
        parent_id: targetParentId,
        active: true,
        position: (maxRow?.position ?? -1) + 1,
        subcategories: cat.subcategories ?? [],
        subcategory_display_modes: cat.subcategory_display_modes ?? {},
        image_path: cat.image_path,
        slideshow_image_paths: cat.slideshow_image_paths ?? [],
        schedule_start: cat.schedule_start,
        schedule_end: cat.schedule_end,
        schedule_off_days: cat.schedule_off_days ?? [],
      })
      .select("id")
      .single();
    if (error || !copy) return { error: error?.message ?? "Falha ao criar a categoria na outra unidade." };
    targetCatId = copy.id;
  }

  const { data: targetDishes } = await supabase.from("dishes").select("name").eq("category_id", targetCatId);
  const existingNames = new Set((targetDishes ?? []).map((d) => normName(d.name)));

  const { data: srcDishes } = await supabase
    .from("dishes")
    .select(DISH_COPY_FIELDS)
    .eq("category_id", categoryId)
    .order("position");

  const cache = new Map<string, string>();
  let copied = 0;
  for (const d of (srcDishes ?? []) as DishRow[]) {
    if (cache.has(d.id)) continue; // já copiado como filho de outro prato
    if (existingNames.has(normName(d.name))) continue; // já existe no destino
    const newId = await copyDishWithComponents(supabase, d, other.id, targetCatId, cache);
    if (newId) {
      copied++;
      existingNames.add(normName(d.name));
    }
  }

  await logAudit({
    action: "create",
    entityType: "category",
    entityId: targetCatId,
    entityLabel: cat.name,
    restaurantId: other.id,
    details: { duplicated_from: categoryId, dishes_copied: copied },
  });
  revalidatePath("/");
  revalidateTag(tags.menu(other.id));
  revalidateMenuOnSite(other.id);
  return { ok: true, unitName: other.name, name: cat.name, count: copied };
}
