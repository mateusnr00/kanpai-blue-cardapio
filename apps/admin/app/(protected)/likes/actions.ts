"use server";

import { revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { revalidateMenuOnSite } from "@/lib/trigger-site-revalidate";

export async function toggleLikesEnabled(enabled: boolean): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();
  const { error } = await supabase
    .from("restaurants")
    .update({ likes_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", restaurantId);
  if (error) return { error: error.message };
  revalidateTag("restaurants");
  revalidateMenuOnSite(restaurantId);
  return {};
}
