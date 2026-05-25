import { createServerClient } from "@/lib/supabase-server";

export type CategoryListItem = {
  id: string;
  number: string;
  name: string;
  position: number;
  total: number;
  active: number;
};

export type CategoryRow = {
  id: string;
  number: string;
  name: string;
  short_name: string | null;
  description: string;
  item_count: string | null;
  detail: string | null;
  gradient: string;
  featured: boolean;
  active: boolean;
  position: number;
  subcategories: string[];
  image_path: string | null;
  full_width: boolean;
};

export async function listCategoriesWithCounts(): Promise<CategoryListItem[]> {
  const supabase = createServerClient();

  const catsRes = await supabase
    .from("categories")
    .select("id, number, name, position")
    .order("position");
  if (catsRes.error) throw catsRes.error;

  const dishesRes = await supabase.from("dishes").select("category_id, active");
  if (dishesRes.error) throw dishesRes.error;

  const counts = new Map<string, { total: number; active: number }>();
  for (const d of dishesRes.data ?? []) {
    const c = counts.get(d.category_id) ?? { total: 0, active: 0 };
    c.total += 1;
    if (d.active) c.active += 1;
    counts.set(d.category_id, c);
  }

  return (catsRes.data ?? []).map((c) => ({
    id: c.id,
    number: c.number,
    name: c.name,
    position: c.position,
    total: counts.get(c.id)?.total ?? 0,
    active: counts.get(c.id)?.active ?? 0,
  }));
}

export async function listCategoriesAll(): Promise<CategoryRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, number, name, short_name, description, item_count, detail, gradient, featured, active, position, subcategories, image_path, full_width")
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getCategory(id: string): Promise<CategoryRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, number, name, short_name, description, item_count, detail, gradient, featured, active, position, subcategories, image_path, full_width")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function countDishesByCategory(id: string): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("dishes")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);
  if (error) throw error;
  return count ?? 0;
}
