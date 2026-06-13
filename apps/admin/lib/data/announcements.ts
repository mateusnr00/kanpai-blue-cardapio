import { createServerClient } from "@/lib/supabase-server";

export type AnnouncementAspect = "portrait" | "square";

export type AnnouncementRow = {
  id: string;
  restaurant_id: string;
  name: string;
  is_active: boolean;
  image_url: string | null;
  aspect: AnnouncementAspect;
  dim: number;
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_days_off: number[];
  sort_order: number;
};

const SELECT =
  "id, restaurant_id, name, is_active, image_url, aspect, dim, schedule_start, schedule_end, schedule_days_off, sort_order";

export async function listAnnouncements(restaurantId: string): Promise<AnnouncementRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(SELECT)
    .eq("restaurant_id", restaurantId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AnnouncementRow[];
}

export async function getAnnouncement(id: string): Promise<AnnouncementRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as AnnouncementRow | null;
}
