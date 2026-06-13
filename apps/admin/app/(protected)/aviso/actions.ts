"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage-actions";
import { publicImageUrl, STORAGE_BUCKET } from "@/lib/storage";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { tags } from "@/lib/cache-tags";
import { revalidateMenuOnSite } from "@/lib/trigger-site-revalidate";
import { logAudit } from "@/lib/audit";

function revalidate(restaurantId: string) {
  revalidatePath("/aviso");
  revalidatePath("/");
  revalidateTag(tags.restaurants());
  revalidateMenuOnSite(restaurantId);
}

/** Extrai o path do storage de uma URL pública (pra poder apagar o arquivo). */
function urlToPath(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  return i >= 0 ? url.slice(i + marker.length) : null;
}

function cleanDateTime(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.slice(0, 16); // "YYYY-MM-DD" ou "YYYY-MM-DDTHH:MM"
}

function parseDaysOff(formData: FormData): number[] {
  return formData
    .getAll("days_off")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

type ParsedFields = {
  name: string;
  isActive: boolean;
  aspect: "portrait" | "square";
  dim: number;
  start: string | null;
  end: string | null;
  daysOff: number[];
};

function parseFields(formData: FormData): ParsedFields {
  const dimRaw = Number(formData.get("dim") ?? 0);
  return {
    name: String(formData.get("name") ?? "").trim() || "Aviso",
    isActive: formData.get("is_active") === "on",
    aspect: String(formData.get("aspect") ?? "portrait") === "square" ? "square" : "portrait",
    dim: Math.max(0, Math.min(90, Number.isFinite(dimRaw) ? Math.round(dimRaw) : 0)),
    start: cleanDateTime(formData.get("schedule_start")),
    end: cleanDateTime(formData.get("schedule_end")),
    daysOff: parseDaysOff(formData),
  };
}

/** Resolve a image_url final (upload novo, remoção, ou mantém a atual). */
async function resolveImageUrl(
  formData: FormData,
  restaurantId: string,
  currentUrl: string | null,
): Promise<string | null> {
  const remove = String(formData.get("image__remove") ?? "false") === "true";
  const file = formData.get("image");

  if (remove) {
    const p = urlToPath(currentUrl);
    if (p) void deleteDishImageAction(p).catch(() => {});
    return null;
  }
  if (file instanceof File && file.size > 0) {
    const res = await uploadDishImageAction(`restaurants/${restaurantId}/announcement-${Date.now()}`, file);
    if ("error" in res) throw new Error(res.error);
    const p = urlToPath(currentUrl);
    if (p) void deleteDishImageAction(p).catch(() => {});
    return publicImageUrl(res.path);
  }
  return currentUrl;
}

export async function createAnnouncement(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();
  const f = parseFields(formData);

  let imageUrl: string | null = null;
  try {
    imageUrl = await resolveImageUrl(formData, restaurantId, null);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: maxRow } = await supabase
    .from("announcements")
    .select("sort_order")
    .eq("restaurant_id", restaurantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("announcements")
    .insert({
      restaurant_id: restaurantId,
      name: f.name,
      is_active: f.isActive,
      image_url: imageUrl,
      aspect: f.aspect,
      dim: f.dim,
      schedule_start: f.start,
      schedule_end: f.end,
      schedule_days_off: f.daysOff,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Falha ao criar." };

  await logAudit({
    action: "create",
    entityType: "announcement",
    entityId: inserted.id,
    entityLabel: f.name,
    restaurantId,
  });
  revalidate(restaurantId);
  redirect("/aviso");
}

export async function updateAnnouncement(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();
  const f = parseFields(formData);

  const { data: current } = await supabase
    .from("announcements")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  const currentUrl = (current as { image_url?: string | null } | null)?.image_url ?? null;

  let imageUrl: string | null = null;
  try {
    imageUrl = await resolveImageUrl(formData, restaurantId, currentUrl);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from("announcements")
    .update({
      name: f.name,
      is_active: f.isActive,
      image_url: imageUrl,
      aspect: f.aspect,
      dim: f.dim,
      schedule_start: f.start,
      schedule_end: f.end,
      schedule_days_off: f.daysOff,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    entityType: "announcement",
    entityId: id,
    entityLabel: f.name,
    restaurantId,
  });
  revalidate(restaurantId);
  redirect("/aviso");
}

export async function toggleAnnouncement(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();
  const { data: existing } = await supabase
    .from("announcements")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase
    .from("announcements")
    .update({ is_active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: "toggle",
    entityType: "announcement",
    entityId: id,
    entityLabel: (existing as { name?: string } | null)?.name ?? null,
    restaurantId,
    details: { is_active: nextActive },
  });
  revalidate(restaurantId);
  return { ok: true as const };
}

export async function deleteAnnouncement(id: string) {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();
  const { data: row } = await supabase
    .from("announcements")
    .select("name, image_url")
    .eq("id", id)
    .maybeSingle();
  const p = urlToPath((row as { image_url?: string | null } | null)?.image_url ?? null);
  if (p) void deleteDishImageAction(p).catch(() => {});

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };
  await logAudit({
    action: "delete",
    entityType: "announcement",
    entityId: id,
    entityLabel: (row as { name?: string } | null)?.name ?? null,
    restaurantId,
  });
  revalidate(restaurantId);
  return { ok: true as const };
}

export async function reorderAnnouncements(orderedIds: string[]) {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();
  const updates = orderedIds.map((id, index) =>
    supabase.from("announcements").update({ sort_order: index }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  await logAudit({
    action: "reorder",
    entityType: "announcement",
    entityLabel: `${orderedIds.length} avisos`,
    restaurantId,
    details: { count: orderedIds.length },
  });
  revalidate(restaurantId);
  return { ok: true as const };
}
