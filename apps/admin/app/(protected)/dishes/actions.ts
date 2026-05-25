"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage-actions";

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
  return { ok: true as const };
}

export async function deleteDish(id: string) {
  const supabase = createServerClient();
  const { data: dish } = await supabase.from("dishes").select("image_path").eq("id", id).maybeSingle();
  if (dish?.image_path) await deleteDishImageAction(dish.image_path);
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
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

export async function createDish(formData: FormData): Promise<{ error?: string }> {
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

  // restaurant_id deriva da categoria escolhida (consistencia garantida)
  const { data: cat } = await supabase
    .from("categories")
    .select("restaurant_id, slug")
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
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Falha ao criar." };

  try {
    const newPath = await handleImage(formData, "image", inserted.id, null);
    if (newPath) {
      await supabase.from("dishes").update({ image_path: newPath }).eq("id", inserted.id);
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  const variants = parseVariants(formData);
  await syncVariants(inserted.id, variants);

  revalidatePath("/");
  redirect(`/?cat=${cat.slug}`);
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

  const { data: current } = await supabase
    .from("dishes")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { data: cat } = await supabase
    .from("categories")
    .select("restaurant_id, slug")
    .eq("id", categoryId)
    .maybeSingle();
  if (!cat) return { error: "Categoria inválida." };

  let imagePath: string | null = current?.image_path ?? null;
  try {
    imagePath = await handleImage(formData, "image", id, current?.image_path ?? null);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
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

  if (error) return { error: error.message };

  const variants = parseVariants(formData);
  await syncVariants(id, variants);

  revalidatePath("/");
  redirect(`/?cat=${cat.slug}`);
}
