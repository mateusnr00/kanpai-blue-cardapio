/**
 * Copia o cardapio completo de um restaurante para outro.
 * Independente: novos UUIDs em tudo + duplica arquivos no Storage.
 *
 * Uso:
 *   SOURCE=flamboyant TARGET=goianiashopping pnpm tsx scripts/copy-restaurant.ts
 *
 * Pre-condicoes:
 * - SUPABASE_SERVICE_ROLE_KEY no env
 * - Restaurante TARGET ja existe na tabela `restaurants`
 * - Restaurante TARGET esta VAZIO (sem categorias)
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { Database } from "../packages/db/src";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SOURCE = process.env.SOURCE ?? "flamboyant";
const TARGET = process.env.TARGET ?? "goianiashopping";
const BUCKET = "dish-images";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureRestaurants() {
  const { data: source } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", SOURCE)
    .maybeSingle();
  if (!source) throw new Error(`Restaurante de origem '${SOURCE}' nao existe.`);

  const { data: target } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", TARGET)
    .maybeSingle();
  if (!target) throw new Error(`Restaurante de destino '${TARGET}' nao existe.`);

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", TARGET);
  if ((count ?? 0) > 0) {
    throw new Error(
      `Restaurante destino '${TARGET}' ja tem ${count} categorias. Limpe antes ou ajuste o script.`,
    );
  }
}

/**
 * Copia um arquivo dentro do bucket, gerando novo path.
 * Retorna o novo path ou null se sourcePath for null/falha.
 */
async function copyStorageFile(sourcePath: string | null): Promise<string | null> {
  if (!sourcePath) return null;
  // gera novo nome: insere "-copy-{rnd}" antes da extensao
  const dot = sourcePath.lastIndexOf(".");
  const base = dot > 0 ? sourcePath.slice(0, dot) : sourcePath;
  const ext = dot > 0 ? sourcePath.slice(dot) : "";
  const newPath = `${base}-${TARGET}-${Date.now().toString(36)}${ext}`;

  const { error } = await supabase.storage.from(BUCKET).copy(sourcePath, newPath);
  if (error) {
    console.warn(`  ! falha copiando ${sourcePath}: ${error.message}`);
    return null;
  }
  return newPath;
}

async function copyMenu() {
  // 1) Categorias
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", SOURCE)
    .order("position");
  if (catErr) throw catErr;
  if (!cats || cats.length === 0) {
    console.log("Nada pra copiar — origem sem categorias.");
    return;
  }

  const catMap = new Map<string, string>(); // sourceUuid -> targetUuid
  for (const c of cats) {
    const newId = randomUUID();
    catMap.set(c.id, newId);
    const newImage = await copyStorageFile(c.image_path);
    const { error } = await supabase.from("categories").insert({
      id: newId,
      restaurant_id: TARGET,
      slug: c.slug,
      number: c.number,
      name: c.name,
      short_name: c.short_name,
      description: c.description,
      item_count: c.item_count,
      detail: c.detail,
      gradient: c.gradient,
      featured: c.featured,
      active: c.active,
      position: c.position,
      subcategories: c.subcategories,
      image_path: newImage,
      full_width: c.full_width,
    });
    if (error) throw new Error(`categoria '${c.slug}': ${error.message}`);
    console.log(`  + categoria ${c.name}`);
  }

  // 2) Pratos
  const { data: dishes, error: dishErr } = await supabase
    .from("dishes")
    .select("*")
    .eq("restaurant_id", SOURCE)
    .order("position");
  if (dishErr) throw dishErr;

  const dishMap = new Map<string, string>();
  for (const d of dishes ?? []) {
    const newId = randomUUID();
    dishMap.set(d.id, newId);
    const newCategoryId = catMap.get(d.category_id);
    if (!newCategoryId) {
      console.warn(`  ! prato '${d.name}' tem category_id sem mapping, pulando.`);
      continue;
    }
    const newImage = await copyStorageFile(d.image_path);
    const { error } = await supabase.from("dishes").insert({
      id: newId,
      restaurant_id: TARGET,
      category_id: newCategoryId,
      slug: d.slug,
      name: d.name,
      description: d.description,
      long_description: d.long_description,
      price: d.price,
      original_price: d.original_price,
      unit: d.unit,
      subcategory: d.subcategory,
      featured: d.featured,
      active: d.active,
      position: d.position,
      badges: d.badges,
      image_path: newImage,
      is_component_only: d.is_component_only,
    });
    if (error) throw new Error(`prato '${d.slug}': ${error.message}`);
    console.log(`  + prato ${d.name}`);
  }

  // 3) Variantes
  if (dishes && dishes.length > 0) {
    const { data: variants } = await supabase
      .from("dish_variants")
      .select("*")
      .in("dish_id", dishes.map((d) => d.id));
    for (const v of variants ?? []) {
      const newDishId = dishMap.get(v.dish_id);
      if (!newDishId) continue;
      const { error } = await supabase.from("dish_variants").insert({
        dish_id: newDishId,
        name: v.name,
        price: v.price,
        image_path: v.image_path, // variantes raramente tem imagem; se tiver, compartilha
        position: v.position,
      });
      if (error) console.warn(`  ! variante ${v.name}: ${error.message}`);
    }
    if (variants && variants.length > 0) console.log(`  + ${variants.length} variantes`);
  }

  // 4) Detail sections
  if (dishes && dishes.length > 0) {
    const { data: sections } = await supabase
      .from("dish_detail_sections")
      .select("*")
      .in("dish_id", dishes.map((d) => d.id));
    for (const s of sections ?? []) {
      const newDishId = dishMap.get(s.dish_id);
      if (!newDishId) continue;
      const { error } = await supabase.from("dish_detail_sections").insert({
        dish_id: newDishId,
        label: s.label,
        description: s.description,
        position: s.position,
      });
      if (error) console.warn(`  ! section ${s.label}: ${error.message}`);
    }
    if (sections && sections.length > 0) console.log(`  + ${sections.length} secoes de detalhe`);
  }

  // 5) Components (parent/child remapeados)
  if (dishes && dishes.length > 0) {
    const { data: comps } = await supabase
      .from("dish_components")
      .select("*")
      .in("parent_dish_id", dishes.map((d) => d.id));
    for (const c of comps ?? []) {
      const newParent = dishMap.get(c.parent_dish_id);
      const newChild = dishMap.get(c.child_dish_id);
      if (!newParent || !newChild) continue;
      const { error } = await supabase.from("dish_components").insert({
        parent_dish_id: newParent,
        child_dish_id: newChild,
        kind: c.kind,
        position: c.position,
      });
      if (error) console.warn(`  ! component: ${error.message}`);
    }
    if (comps && comps.length > 0) console.log(`  + ${comps.length} components`);
  }
}

async function main() {
  console.log(`Copiando ${SOURCE} -> ${TARGET}\n`);
  await ensureRestaurants();
  await copyMenu();
  console.log(`\nFeito. Cardapio de ${TARGET} agora e independente de ${SOURCE}.`);
}

main().catch((err) => {
  console.error("\nERRO:", err.message);
  process.exit(1);
});
