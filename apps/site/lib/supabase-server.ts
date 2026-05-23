import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kanpai/db";

let cached: SupabaseClient<Database> | null = null;

/**
 * Cliente Supabase pro site publico — anonimo, sem cookies, sem sessao.
 * Funciona em Server Components, Route Handlers e generateStaticParams
 * (este ultimo roda em build time, fora de qualquer request scope).
 */
export function createServerClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY sao obrigatorios");
  }
  cached = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
