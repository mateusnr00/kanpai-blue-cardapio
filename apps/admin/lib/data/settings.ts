import { createServerClient } from "@/lib/supabase-server";

export type SiteSettings = {
  metaPixelId: string;
  ga4Id: string;
  googleAdsId: string;
  tiktokPixelId: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("meta_pixel_id, ga4_id, google_ads_id, tiktok_pixel_id")
    .eq("id", "default")
    .maybeSingle();
  return {
    metaPixelId: data?.meta_pixel_id ?? "",
    ga4Id: data?.ga4_id ?? "",
    googleAdsId: data?.google_ads_id ?? "",
    tiktokPixelId: data?.tiktok_pixel_id ?? "",
  };
}
