"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kanpai/db";

const VISITOR_KEY = "kanpai-visitor-id";
const SESSION_KEY = "kanpai-session-id";
const INTERNAL_KEY = "kanpai-internal-traffic";

/**
 * Marca o aparelho como tráfego interno (equipe do restaurante).
 * Ativa via ?staff=1 e desativa via ?staff=0. A flag fica no localStorage,
 * então uma vez marcado o aparelho continua sendo filtrado nas analytics
 * mesmo em visitas futuras — sem precisar repassar o query param toda vez.
 */
function syncInternalFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const staff = params.get("staff");
    if (staff === "1") window.localStorage.setItem(INTERNAL_KEY, "1");
    else if (staff === "0") window.localStorage.removeItem(INTERNAL_KEY);
    return window.localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // fallback simples (não-crypto, OK pra ID de tracking)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreate(storage: Storage, key: string): string {
  try {
    let v = storage.getItem(key);
    if (!v) {
      v = safeUuid();
      storage.setItem(key, v);
    }
    return v;
  } catch {
    return safeUuid();
  }
}

let cached: SupabaseClient<Database> | null = null;
function getClient(): SupabaseClient<Database> | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cached = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type AnalyticsEventInput = {
  event_type: "home_view" | "category_open" | "dish_view" | "dish_impression";
  category_id?: string | null;
  dish_slug?: string | null;
  restaurant_id: string;
};

export async function track(input: AnalyticsEventInput): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const visitor_id = getOrCreate(window.localStorage, VISITOR_KEY);
    const session_id = getOrCreate(window.sessionStorage, SESSION_KEY);
    const supabase = getClient();
    if (!supabase) return;
    const is_internal = syncInternalFlag();
    await supabase.from("analytics_events").insert({
      visitor_id,
      session_id,
      event_type: input.event_type,
      restaurant_id: input.restaurant_id,
      category_id: input.category_id ?? null,
      dish_slug: input.dish_slug ?? null,
      pathname: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent.slice(0, 200),
      is_internal,
    });
  } catch {
    // analytics nunca pode quebrar a UI
  }
}
