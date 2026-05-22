"use client";

import { createBrowserClient as createSSR } from "@supabase/ssr";
import type { Database } from "@kanpai/db";

export function createBrowserClient() {
  return createSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
