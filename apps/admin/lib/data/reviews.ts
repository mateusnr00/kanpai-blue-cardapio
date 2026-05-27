import { createServerClient } from "@/lib/supabase-server";

export type ReviewRow = {
  id: string;
  restaurant_id: string;
  overall: number;
  food: number | null;
  ambience: number | null;
  service: number | null;
  waiter_name: string | null;
  comment: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  read_at: string | null;
  created_at: string;
};

export type ReviewStats = {
  total: number;
  unread: number;
  averages: {
    overall: number | null;
    food: number | null;
    ambience: number | null;
    service: number | null;
  };
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function listReviews(restaurantId: string): Promise<ReviewRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

export async function countUnreadReviews(restaurantId: string): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .is("read_at", null);
  if (error) {
    console.error("[countUnreadReviews]", error);
    return 0;
  }
  return count ?? 0;
}

export function computeReviewStats(rows: ReviewRow[]): ReviewStats {
  const dist: ReviewStats["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let unread = 0;
  let overallSum = 0;
  let overallCount = 0;
  let foodSum = 0;
  let foodCount = 0;
  let ambSum = 0;
  let ambCount = 0;
  let svcSum = 0;
  let svcCount = 0;
  for (const r of rows) {
    if (r.read_at == null) unread++;
    const o = r.overall as 1 | 2 | 3 | 4 | 5;
    dist[o] = (dist[o] ?? 0) + 1;
    overallSum += r.overall;
    overallCount++;
    if (r.food != null) {
      foodSum += r.food;
      foodCount++;
    }
    if (r.ambience != null) {
      ambSum += r.ambience;
      ambCount++;
    }
    if (r.service != null) {
      svcSum += r.service;
      svcCount++;
    }
  }
  return {
    total: rows.length,
    unread,
    averages: {
      overall: overallCount ? overallSum / overallCount : null,
      food: foodCount ? foodSum / foodCount : null,
      ambience: ambCount ? ambSum / ambCount : null,
      service: svcCount ? svcSum / svcCount : null,
    },
    distribution: dist,
  };
}
