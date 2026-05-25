import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase-server";

const COOKIE_NAME = "kanpai-admin-restaurant";
const DEFAULT_RESTAURANT = "flamboyant";

export type RestaurantRow = {
  id: string;
  name: string;
  short_name: string;
  active: boolean;
  position: number;
};

/**
 * Lê o restaurante ativo do cookie do admin. Defaults to 'flamboyant'.
 * Server-only (usa next/headers).
 */
export function getActiveRestaurantId(): string {
  try {
    return cookies().get(COOKIE_NAME)?.value || DEFAULT_RESTAURANT;
  } catch {
    return DEFAULT_RESTAURANT;
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
