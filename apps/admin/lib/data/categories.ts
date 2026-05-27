import { createServerClient } from "@/lib/supabase-server";

export type CategoryListItem = {
  id: string;
  slug: string;
  number: string;
  name: string;
  position: number;
  total: number;
  active: number;
};

export type CategoryRow = {
  id: string;
  slug: string;
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
  subcategory_display_modes: Record<string, "grid" | "list">;
  image_path: string | null;
  slideshow_image_paths: string[];
  full_width: boolean;
  display_mode: "grid" | "list";
  cover_aspect: "wide" | "square";
  restaurant_id: string;
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_off_days: number[];
};

const CATEGORY_FIELDS =
  "id, slug, number, name, short_name, description, item_count, detail, gradient, featured, active, position, subcategories, subcategory_display_modes, image_path, slideshow_image_paths, full_width, display_mode, cover_aspect, restaurant_id, schedule_start, schedule_end, schedule_off_days";

export async function listCategoriesWithCounts(restaurantId: string): Promise<CategoryListItem[]> {
  const supabase = createServerClient();

  const [catsRes, dishesRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, number, name, position")
      .eq("restaurant_id", restaurantId)
      .order("position"),
    supabase
      .from("dishes")
      .select("category_id, active")
      .eq("restaurant_id", restaurantId)
      .eq("is_component_only", false),
  ]);
  if (catsRes.error) throw catsRes.error;
  if (dishesRes.error) throw dishesRes.error;

  const counts = new Map<string, { total: number; active: number }>();
  function bump(categoryId: string, active: boolean) {
    const c = counts.get(categoryId) ?? { total: 0, active: 0 };
    c.total += 1;
    if (active) c.active += 1;
    counts.set(categoryId, c);
  }
  for (const d of dishesRes.data ?? []) bump(d.category_id, d.active);

  return (catsRes.data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    number: c.number,
    name: c.name,
    position: c.position,
    total: counts.get(c.id)?.total ?? 0,
    active: counts.get(c.id)?.active ?? 0,
  }));
}

function coerceRow(row: Record<string, unknown>): CategoryRow {
  const mode = row.display_mode === "list" ? "list" : "grid";
  const rawModes = row.subcategory_display_modes;
  const subcategory_display_modes: Record<string, "grid" | "list"> = {};
  if (rawModes && typeof rawModes === "object" && !Array.isArray(rawModes)) {
    for (const [k, v] of Object.entries(rawModes)) {
      subcategory_display_modes[k] = v === "list" ? "list" : "grid";
    }
  }
  return { ...row, display_mode: mode, subcategory_display_modes } as CategoryRow;
}

export async function listCategoriesAll(restaurantId: string): Promise<CategoryRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_FIELDS)
    .eq("restaurant_id", restaurantId)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((r) => coerceRow(r as Record<string, unknown>));
}

export async function getCategory(id: string): Promise<CategoryRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? coerceRow(data as Record<string, unknown>) : null;
}

/**
 * Lookup por slug DENTRO de uma unidade (uma categoria por slug por restaurant).
 * Usado na home do admin pra resolver `?cat=festival` no contexto do restaurante ativo.
 */
export async function getCategoryBySlug(slug: string, restaurantId: string): Promise<CategoryRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_FIELDS)
    .eq("restaurant_id", restaurantId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? coerceRow(data as Record<string, unknown>) : null;
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
