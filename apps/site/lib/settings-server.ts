import { unstable_cache } from "next/cache";
import { createServerClient } from "./supabase-server";
import { tags } from "./cache-tags";

export type SiteSettings = {
  metaPixelId: string | null;
  ga4Id: string | null;
  googleAdsId: string | null;
  tiktokPixelId: string | null;
};

const EMPTY: SiteSettings = {
  metaPixelId: null,
  ga4Id: null,
  googleAdsId: null,
  tiktokPixelId: null,
};

async function getSiteSettingsImpl(): Promise<SiteSettings> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("meta_pixel_id, ga4_id, google_ads_id, tiktok_pixel_id")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) return EMPTY;
  const clean = (v: string | null) => (v && v.trim() ? v.trim() : null);
  return {
    metaPixelId: clean(data.meta_pixel_id),
    ga4Id: clean(data.ga4_id),
    googleAdsId: clean(data.google_ads_id),
    tiktokPixelId: clean(data.tiktok_pixel_id),
  };
}

export const getSiteSettings = unstable_cache(getSiteSettingsImpl, ["site:settings"], {
  tags: [tags.siteSettings()],
  revalidate: 3600,
});
