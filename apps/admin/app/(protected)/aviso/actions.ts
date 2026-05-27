"use server";

import { revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage-actions";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

const ANNOUNCEMENT_TAG = "restaurants";

export async function saveAnnouncement(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();

  const active = formData.get("announcement_active") === "on";

  // Foto atual
  const { data: current, error: readErr } = await supabase
    .from("restaurants")
    .select("announcement_image_path")
    .eq("id", restaurantId)
    .maybeSingle();
  if (readErr) return { error: readErr.message };
  const currentPath = (current as { announcement_image_path?: string | null } | null)?.announcement_image_path ?? null;

  // Processa imagem
  let imagePath: string | null = currentPath;
  const remove = String(formData.get("announcement_image__remove") ?? "false") === "true";
  const file = formData.get("announcement_image");

  if (remove) {
    if (currentPath) await deleteDishImageAction(currentPath);
    imagePath = null;
  } else if (file instanceof File && file.size > 0) {
    if (currentPath) await deleteDishImageAction(currentPath);
    const ts = Date.now();
    const res = await uploadDishImageAction(`restaurants/${restaurantId}/announcement-${ts}`, file);
    if ("error" in res) return { error: res.error };
    imagePath = res.path;
  }

  const { error } = await supabase
    .from("restaurants")
    .update({
      announcement_active: active,
      announcement_image_path: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", restaurantId);

  if (error) return { error: error.message };

  revalidateTag(ANNOUNCEMENT_TAG);
  return {};
}
