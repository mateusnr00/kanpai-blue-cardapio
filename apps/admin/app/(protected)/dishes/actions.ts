"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage-actions";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { tags } from "@/lib/cache-tags";
import { revalidateMenuOnSite } from "@/lib/trigger-site-revalidate";

function revalidateMenu() {
  const restaurantId = getActiveRestaurantId();
  revalidateTag(tags.menu(restaurantId));
  revalidateMenuOnSite(restaurantId);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `prato-${Date.now()}`;
}

export async function toggleDishActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("dishes")
    .update({ active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidateMenu();
  return { ok: true as const };
}

export async function deleteDish(id: string) {
  const supabase = createServerClient();
  const { data: dish } = await supabase.from("dishes").select("image_path").eq("id", id).maybeSingle();
  if (dish?.image_path) await deleteDishImageAction(dish.image_path);
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidateMenu();
  return { ok: true as const };
}

export async function reorderDishes(categoryId: string, orderedIds: string[]) {
  const supabase = createServerClient();
  const updates = orderedIds.map((id, index) =>
    supabase.from("dishes").update({ position: index }).eq("id", id).eq("category_id", categoryId)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  revalidatePath("/");
  revalidateMenu();
  return { ok: true as const };
}

type VariantInput = { id: string; name: string; price: string };

function parseVariants(formData: FormData): VariantInput[] {
  const count = Number(formData.get("variants_count") ?? "0");
  const out: VariantInput[] = [];
  for (let i = 0; i < count; i++) {
    const name = String(formData.get(`variant_${i}_name`) ?? "").trim();
    const price = String(formData.get(`variant_${i}_price`) ?? "").trim();
    const id = String(formData.get(`variant_${i}_id`) ?? "");
    if (name && price) out.push({ id, name, price });
  }
  return out;
}

async function syncVariants(dishId: string, variants: VariantInput[]) {
  const supabase = createServerClient();
  await supabase.from("dish_variants").delete().eq("dish_id", dishId);
  if (variants.length === 0) return;
  const rows = variants.map((v, i) => ({
    dish_id: dishId,
    name: v.name,
    price: v.price,
    position: i,
  }));
  await supabase.from("dish_variants").insert(rows);
}

function extractBadges(formData: FormData): string[] {
  return formData.getAll("badges").map((b) => String(b));
}

type ComponentInput = {
  childId: string;
  kind: "entrada" | "principal" | "sobremesa";
};

function parseComponents(formData: FormData): ComponentInput[] {
  const count = Number(formData.get("components_count") ?? "0");
  const out: ComponentInput[] = [];
  for (let i = 0; i < count; i++) {
    const childId = String(formData.get(`component_${i}_id`) ?? "").trim();
    const kind = String(formData.get(`component_${i}_kind`) ?? "").trim();
    if (!childId) continue;
    if (kind !== "entrada" && kind !== "principal" && kind !== "sobremesa") continue;
    out.push({ childId, kind: kind as ComponentInput["kind"] });
  }
  return out;
}

async function syncComponents(parentDishId: string, components: ComponentInput[]) {
  const supabase = createServerClient();
  await supabase.from("dish_components").delete().eq("parent_dish_id", parentDishId);
  if (components.length === 0) return;
  // numera position dentro de cada kind
  const counters: Record<ComponentInput["kind"], number> = { entrada: 0, principal: 0, sobremesa: 0 };
  const rows = components.map((c) => ({
    parent_dish_id: parentDishId,
    child_dish_id: c.childId,
    kind: c.kind,
    position: counters[c.kind]++,
  }));
  await supabase.from("dish_components").insert(rows);
}

async function handleImage(
  formData: FormData,
  prefix: "image",
  dishId: string,
  currentPath: string | null
): Promise<string | null> {
  const remove = String(formData.get(`${prefix}__remove`) ?? "false") === "true";
  const file = formData.get(prefix);

  if (remove) {
    if (currentPath) await deleteDishImageAction(currentPath);
    return null;
  }

  if (file instanceof File && file.size > 0) {
    if (currentPath) await deleteDishImageAction(currentPath);
    const res = await uploadDishImageAction(dishId, file);
    if ("error" in res) throw new Error(res.error);
    return res.path;
  }

  return currentPath;
}

type CreateDishCoreResult =
  | { error: string }
  | {
      ok: true;
      id: string;
      categorySlug: string;
      categoryName: string;
      name: string;
      price: string | null;
      imagePath: string | null;
    };

async function createDishCore(
  formData: FormData,
  opts: { isComponentOnly: boolean },
): Promise<CreateDishCoreResult> {
  const supabase = createServerClient();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = String(formData.get("price") ?? "").trim() || null;
  const originalPrice = String(formData.get("original_price") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const badges = extractBadges(formData);

  if (!name || !categoryId) return { error: "Nome e categoria obrigatórios." };

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(name);

  const { data: cat } = await supabase
    .from("categories")
    .select("restaurant_id, slug, name")
    .eq("id", categoryId)
    .maybeSingle();
  if (!cat) return { error: "Categoria inválida." };

  const { data: maxRow } = await supabase
    .from("dishes")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("dishes")
    .insert({
      slug,
      category_id: categoryId,
      restaurant_id: cat.restaurant_id,
      name,
      description,
      price,
      original_price: originalPrice,
      subcategory,
      featured,
      badges,
      active: true,
      position,
      is_component_only: opts.isComponentOnly,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Falha ao criar." };

  const variants = parseVariants(formData);
  const components = parseComponents(formData);

  let imagePath: string | null = null;
  const imagePromise = (async () => {
    imagePath = await handleImage(formData, "image", inserted.id, null);
    if (imagePath) {
      await supabase.from("dishes").update({ image_path: imagePath }).eq("id", inserted.id);
    }
  })();

  try {
    await Promise.all([
      imagePromise,
      syncVariants(inserted.id, variants),
      syncComponents(inserted.id, components),
    ]);
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/");
  revalidateMenu();

  return {
    ok: true,
    id: inserted.id,
    categorySlug: cat.slug,
    categoryName: cat.name,
    name,
    price,
    imagePath,
  };
}

export async function createDish(formData: FormData): Promise<{ error?: string }> {
  const res = await createDishCore(formData, { isComponentOnly: false });
  if ("error" in res) return { error: res.error };
  redirect(`/?cat=${res.categorySlug}`);
}

export type CreateDishForComponentResult =
  | { error: string }
  | {
      ok: true;
      dish: {
        id: string;
        name: string;
        category: string;
        image_path: string | null;
        price: string | null;
      };
    };

export async function createDishForComponent(
  formData: FormData,
): Promise<CreateDishForComponentResult> {
  const res = await createDishCore(formData, { isComponentOnly: true });
  if ("error" in res) return { error: res.error };
  return {
    ok: true,
    dish: {
      id: res.id,
      name: res.name,
      category: res.categoryName,
      image_path: res.imagePath,
      price: res.price,
    },
  };
}

export async function updateDish(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = String(formData.get("price") ?? "").trim() || null;
  const originalPrice = String(formData.get("original_price") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const badges = extractBadges(formData);

  if (!name || !categoryId) return { error: "Nome e categoria obrigatórios." };

  const [{ data: current }, { data: cat }] = await Promise.all([
    supabase.from("dishes").select("image_path").eq("id", id).maybeSingle(),
    supabase.from("categories").select("restaurant_id, slug").eq("id", categoryId).maybeSingle(),
  ]);
  if (!cat) return { error: "Categoria inválida." };

  let imagePath: string | null = current?.image_path ?? null;
  try {
    imagePath = await handleImage(formData, "image", id, current?.image_path ?? null);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const variants = parseVariants(formData);
  const components = parseComponents(formData);

  const updatePromise = supabase
    .from("dishes")
    .update({
      category_id: categoryId,
      restaurant_id: cat.restaurant_id,
      name,
      description,
      price,
      original_price: originalPrice,
      subcategory,
      featured,
      badges,
      image_path: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const [updRes] = await Promise.all([
    updatePromise,
    syncVariants(id, variants),
    syncComponents(id, components),
  ]);

  if (updRes.error) return { error: updRes.error.message };

  revalidatePath("/");
  revalidateMenu();
  redirect(`/?cat=${cat.slug}`);
}
