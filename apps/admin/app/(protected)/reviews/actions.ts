"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function markReviewRead(id: string): Promise<{ ok: true } | { error: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) return { error: error.message };
  revalidatePath("/reviews");
  return { ok: true };
}

export async function markAllReviewsRead(restaurantId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ read_at: new Date().toISOString() })
    .eq("restaurant_id", restaurantId)
    .is("read_at", null);
  if (error) return { error: error.message };
  revalidatePath("/reviews");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<{ ok: true } | { error: string }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reviews");
  return { ok: true };
}
