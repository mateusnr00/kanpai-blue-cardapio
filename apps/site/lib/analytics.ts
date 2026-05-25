"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kanpai/db";

const VISITOR_KEY = "kanpai-visitor-id";
const SESSION_KEY = "kanpai-session-id";

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
    });
  } catch {
    // analytics nunca pode quebrar a UI
  }
}
