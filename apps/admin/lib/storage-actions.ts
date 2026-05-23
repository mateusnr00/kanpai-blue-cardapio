"use server";

import { cookies } from "next/headers";
import { createServerClient as createSSR } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kanpai/db";
import { STORAGE_BUCKET } from "./storage";

function authedClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const client = createSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  return client as unknown as SupabaseClient<Database>;
}

export async function uploadDishImageAction(
  pathBase: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) ? ext : "jpg";
  const path = `${pathBase}.${safeExt}`;

  const supabase = authedClient();
  const arrayBuf = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, arrayBuf, { contentType: file.type || `image/${safeExt}`, upsert: true });

  if (error) return { error: error.message };
  return { path };
}

export async function deleteDishImageAction(path: string): Promise<{ ok: true } | { error: string }> {
  const supabase = authedClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) return { error: error.message };
  return { ok: true };
}
