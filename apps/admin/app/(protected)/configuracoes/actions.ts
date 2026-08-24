"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { tags } from "@/lib/cache-tags";
import { revalidateSettingsOnSite } from "@/lib/trigger-site-revalidate";
import { logAudit } from "@/lib/audit";

export type SettingsInput = {
  metaPixelId: string;
  ga4Id: string;
  googleAdsId: string;
  tiktokPixelId: string;
};

const clean = (v: string) => {
  const t = (v ?? "").trim();
  return t.length ? t : null;
};

export async function saveSettings(input: SettingsInput): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      meta_pixel_id: clean(input.metaPixelId),
      ga4_id: clean(input.ga4Id),
      google_ads_id: clean(input.googleAdsId),
      tiktok_pixel_id: clean(input.tiktokPixelId),
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    entityType: "site_settings",
    entityLabel: "Pixels & Analytics",
    details: {
      meta: !!clean(input.metaPixelId),
      ga4: !!clean(input.ga4Id),
      googleAds: !!clean(input.googleAdsId),
      tiktok: !!clean(input.tiktokPixelId),
    },
  });

  revalidateTag(tags.siteSettings());
  revalidatePath("/configuracoes");
  revalidateSettingsOnSite();
  return {};
}
