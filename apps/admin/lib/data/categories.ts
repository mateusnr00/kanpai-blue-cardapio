import { createServerClient } from "@/lib/supabase-server";

export type CategoryListItem = {
  id: string;
  number: string;
  name: string;
  position: number;
  total: number;
  active: number;
};

export async function listCategoriesWithCounts(): Promise<CategoryListItem[]> {
  const supabase = createServerClient();

  const categoriesRes = await supabase
    .from("categories")
    .select("id, number, name, position")
    .order("position");
  if (categoriesRes.error) throw categoriesRes.error;
  const categories = categoriesRes.data;

  const dishesRes = await supabase.from("dishes").select("category_id, active");
  if (dishesRes.error) throw dishesRes.error;
  const dishes = dishesRes.data;

  const counts = new Map<string, { total: number; active: number }>();
  for (const d of dishes ?? []) {
    const c = counts.get(d.category_id) ?? { total: 0, active: 0 };
    c.total += 1;
    if (d.active) c.active += 1;
    counts.set(d.category_id, c);
  }

  return (categories ?? []).map((c) => ({
    id: c.id,
    number: c.number,
    name: c.name,
    position: c.position,
    total: counts.get(c.id)?.total ?? 0,
    active: counts.get(c.id)?.active ?? 0,
  }));
}
