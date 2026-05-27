"use server";

import { revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { tags } from "@/lib/cache-tags";
import { revalidateMenuOnSite } from "@/lib/trigger-site-revalidate";

export type DisplayFlag =
  | "show_category_eyebrow"
  | "show_category_subtitle"
  | "show_home_footer_count"
  | "show_category_footer_count";

export async function toggleDisplayFlag(
  flag: DisplayFlag,
  value: boolean,
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const restaurantId = getActiveRestaurantId();

  const update: Record<string, boolean | string> = {
    [flag]: value,
    updated_at: new Date().toISOString(),
  };

  // Cast pra contornar o tipo Update fortemente tipado do Supabase
  // (atualizamos uma coluna dinamica entre as 4 flags conhecidas)
  const { error } = await supabase
    .from("restaurants")
    .update(update as never)
    .eq("id", restaurantId);
  if (error) return { error: error.message };

  revalidateTag(tags.restaurants());
  revalidateMenuOnSite(restaurantId);
  return {};
}
