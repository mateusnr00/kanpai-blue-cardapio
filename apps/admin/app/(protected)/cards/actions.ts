"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage-actions";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `categoria-${Date.now()}`;
}

function extractSubcategories(formData: FormData): string[] {
  return formData.getAll("subcategory").map((s) => String(s).trim()).filter(Boolean);
}

async function handleCategoryImage(
  formData: FormData,
  categoryId: string,
  currentPath: string | null
): Promise<string | null> {
  const remove = String(formData.get("image__remove") ?? "false") === "true";
  const file = formData.get("image");

  if (remove) {
    if (currentPath) await deleteDishImageAction(currentPath);
    return null;
  }

  if (file instanceof File && file.size > 0) {
    if (currentPath) await deleteDishImageAction(currentPath);
    const res = await uploadDishImageAction(`categories/${categoryId}`, file);
    if ("error" in res) throw new Error(res.error);
    return res.path;
  }

  return currentPath;
}

export async function toggleCategoryActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("categories")
    .update({ active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/cards");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  const supabase = createServerClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();
  if (cat?.image_path) await deleteDishImageAction(cat.image_path);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/cards");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderCategories(orderedIds: string[]) {
  const supabase = createServerClient();
  const updates = orderedIds.map((id, index) =>
    supabase.from("categories").update({ position: index }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  revalidatePath("/cards");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createCategory(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const item_count = String(formData.get("item_count") ?? "").trim() || null;
  const detail = String(formData.get("detail") ?? "").trim() || null;
  const gradient = String(formData.get("gradient") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const full_width = formData.get("full_width") === "on";
  const subcategories = extractSubcategories(formData);

  if (!name || !number || !description || !gradient) {
    return { error: "Nome, número, descrição e gradient são obrigatórios." };
  }

  const restaurantId = getActiveRestaurantId();

  let slug = String(formData.get("id") ?? "").trim();
  if (!slug) slug = slugify(name);

  const { data: maxRow } = await supabase
    .from("categories")
    .select("position")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data: inserted, error: insertErr } = await supabase
    .from("categories")
    .insert({
      slug,
      restaurant_id: restaurantId,
      number,
      name,
      short_name,
      description,
      item_count,
      detail,
      gradient,
      featured,
      full_width,
      active: true,
      position,
      subcategories,
    })
    .select("id")
    .single();

  if (insertErr || !inserted) return { error: insertErr?.message ?? "Falha ao criar." };

  try {
    const newPath = await handleCategoryImage(formData, inserted.id, null);
    if (newPath) {
      await supabase.from("categories").update({ image_path: newPath }).eq("id", inserted.id);
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/cards");
  revalidatePath("/");
  redirect("/cards");
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const item_count = String(formData.get("item_count") ?? "").trim() || null;
  const detail = String(formData.get("detail") ?? "").trim() || null;
  const gradient = String(formData.get("gradient") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const full_width = formData.get("full_width") === "on";
  const subcategories = extractSubcategories(formData);

  if (!name || !number || !description || !gradient) {
    return { error: "Nome, número, descrição e gradient são obrigatórios." };
  }

  const { data: current } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  let imagePath: string | null = current?.image_path ?? null;
  try {
    imagePath = await handleCategoryImage(formData, id, current?.image_path ?? null);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      number,
      name,
      short_name,
      description,
      item_count,
      detail,
      gradient,
      featured,
      full_width,
      subcategories,
      image_path: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/cards");
  revalidatePath("/");
  redirect("/cards");
}
