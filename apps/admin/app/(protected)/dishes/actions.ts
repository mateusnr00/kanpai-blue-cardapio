"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

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
