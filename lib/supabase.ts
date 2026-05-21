import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase singleton para uso no browser.
 * Retorna null se as env vars não estiverem configuradas (graceful degrade).
 */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/**
 * Busca todas as contagens de like agregadas.
 * Retorna { [dishId]: count }.
 */
export async function fetchAllLikes(): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.from("dish_likes").select("dish_id, count");
  if (error || !data) return {};
  const out: Record<string, number> = {};
  for (const row of data) {
    out[row.dish_id] = row.count ?? 0;
  }
  return out;
}

export async function incrementLike(dishId: string): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("increment_dish_like", { p_dish_id: dishId });
  if (error) {
    console.error("[likes] increment failed:", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}

export async function decrementLike(dishId: string): Promise<number | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("decrement_dish_like", { p_dish_id: dishId });
  if (error) {
    console.error("[likes] decrement failed:", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}
