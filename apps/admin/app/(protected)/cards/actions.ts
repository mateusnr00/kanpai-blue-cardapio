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
    .slice(0, 64) || `categoria-${Date.now()}`;
}

function extractSubcategories(formData: FormData): {
  names: string[];
  modes: Record<string, "grid" | "list">;
} {
  const count = Number(formData.get("subcategory_count") ?? "0");
  if (count > 0) {
    const names: string[] = [];
    const modes: Record<string, "grid" | "list"> = {};
    for (let i = 0; i < count; i++) {
      const name = String(formData.get(`subcategory_${i}_name`) ?? "").trim();
      if (!name) continue;
      const rawMode = String(formData.get(`subcategory_${i}_mode`) ?? "grid").trim();
      const mode = rawMode === "list" ? "list" : "grid";
      names.push(name);
      modes[name] = mode;
    }
    return { names, modes };
  }
  // Fallback legacy (sem o count): pega so os nomes via "subcategory"
  const names = formData.getAll("subcategory").map((s) => String(s).trim()).filter(Boolean);
  return { names, modes: {} };
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

async function handleSlideshowImages(
  formData: FormData,
  categoryId: string,
  currentPaths: string[],
): Promise<string[]> {
  const count = Number(formData.get("slideshow_count") ?? "0");
  const finalPaths: string[] = [];

  for (let i = 0; i < count; i++) {
    const existingPath = String(formData.get(`slideshow_${i}_path`) ?? "").trim();
    if (existingPath) {
      finalPaths.push(existingPath);
      continue;
    }
    const file = formData.get(`slideshow_${i}_file`);
    if (!(file instanceof File) || file.size === 0) continue;

    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const res = await uploadDishImageAction(
      `categories/${categoryId}/slideshow-${ts}-${rand}`,
      file,
    );
    if ("error" in res) throw new Error(res.error);
    finalPaths.push(res.path);
  }

  // Apaga do storage os caminhos antigos que sairam do slideshow
  const finalSet = new Set(finalPaths);
  for (const old of currentPaths) {
    if (!finalSet.has(old)) {
      await deleteDishImageAction(old);
    }
  }

  return finalPaths;
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
  revalidateMenu();
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  const supabase = createServerClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("image_path, slideshow_image_paths")
    .eq("id", id)
    .maybeSingle();
  if (cat?.image_path) await deleteDishImageAction(cat.image_path);
  const slideshowPaths = (cat as { slideshow_image_paths?: string[] } | null)?.slideshow_image_paths ?? [];
  for (const p of slideshowPaths) {
    await deleteDishImageAction(p);
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/cards");
  revalidatePath("/");
  revalidateMenu();
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
  revalidateMenu();
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
  const display_mode_raw = String(formData.get("display_mode") ?? "grid").trim();
  const display_mode = display_mode_raw === "list" ? "list" : "grid";
  const { names: subcategories, modes: subcategory_display_modes } = extractSubcategories(formData);

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
      display_mode,
      active: true,
      position,
      subcategories,
      subcategory_display_modes,
    })
    .select("id")
    .single();

  if (insertErr || !inserted) return { error: insertErr?.message ?? "Falha ao criar." };

  try {
    const newPath = await handleCategoryImage(formData, inserted.id, null);
    const newSlideshow = await handleSlideshowImages(formData, inserted.id, []);
    const update: { image_path?: string; slideshow_image_paths?: string[] } = {};
    if (newPath) update.image_path = newPath;
    if (newSlideshow.length > 0) update.slideshow_image_paths = newSlideshow;
    if (Object.keys(update).length > 0) {
      const { error: imgErr } = await supabase
        .from("categories")
        .update(update)
        .eq("id", inserted.id);
      if (imgErr) return { error: imgErr.message };
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/cards");
  revalidatePath("/");
  revalidateMenu();
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
  const display_mode_raw = String(formData.get("display_mode") ?? "grid").trim();
  const display_mode = display_mode_raw === "list" ? "list" : "grid";
  const { names: subcategories, modes: subcategory_display_modes } = extractSubcategories(formData);

  if (!name || !number || !description || !gradient) {
    return { error: "Nome, número, descrição e gradient são obrigatórios." };
  }

  const { data: current } = await supabase
    .from("categories")
    .select("image_path, slideshow_image_paths")
    .eq("id", id)
    .maybeSingle();

  let imagePath: string | null = current?.image_path ?? null;
  let slideshowPaths: string[] = (current as { slideshow_image_paths?: string[] } | null)?.slideshow_image_paths ?? [];
  try {
    imagePath = await handleCategoryImage(formData, id, current?.image_path ?? null);
    slideshowPaths = await handleSlideshowImages(formData, id, slideshowPaths);
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
      display_mode,
      subcategories,
      subcategory_display_modes,
      image_path: imagePath,
      slideshow_image_paths: slideshowPaths,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/cards");
  revalidatePath("/");
  revalidateMenu();
  redirect("/cards");
}
