import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase-server";
import { RESTAURANT_DEFAULT_ID, type RestaurantRow } from "./restaurants-shared";

const COOKIE_NAME = "kanpai-admin-restaurant";

export type { RestaurantRow };
export { restaurantPublicUrl, RESTAURANT_DEFAULT_ID } from "./restaurants-shared";

/**
 * Lê o restaurante ativo do cookie do admin. Defaults to 'flamboyant'.
 * Server-only (usa next/headers).
 */
export function getActiveRestaurantId(): string {
  try {
    return cookies().get(COOKIE_NAME)?.value || RESTAURANT_DEFAULT_ID;
  } catch {
    return RESTAURANT_DEFAULT_ID;
  }
}

export async function listRestaurants(): Promise<RestaurantRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, short_name, active, position")
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveRestaurant(): Promise<RestaurantRow | null> {
  const id = getActiveRestaurantId();
  const all = await listRestaurants();
  return all.find((r) => r.id === id) ?? all[0] ?? null;
}

export const RESTAURANT_COOKIE = COOKIE_NAME;
