import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kanpai/db";

let cached: SupabaseClient<Database> | null = null;

/**
 * Cliente Supabase com SERVICE_ROLE_KEY — bypassa RLS e libera os endpoints
 * de auth.admin (createUser, deleteUser, listUsers). Use SO em Server Actions
 * e nunca exponha pro browser.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurado");
  }
  cached = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
