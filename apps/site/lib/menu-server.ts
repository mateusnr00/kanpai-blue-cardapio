import { createServerClient } from "./supabase-server";
import type { Category, Dish, DishDetailSection } from "./menu-types";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/dish-images/`;

function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${STORAGE_BASE}${path}`;
}

export type RestaurantInfo = {
  id: string;
  name: string;
  shortName: string;
};

export async function listRestaurants(): Promise<RestaurantInfo[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, short_name, position")
    .eq("active", true)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, shortName: r.short_name }));
}

export async function getRestaurantById(id: string): Promise<RestaurantInfo | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, short_name")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, name: data.name, shortName: data.short_name };
}

/**
 * Carrega o cardápio completo de uma unidade. Devolve `Category[]` no shape
 * usado pelos componentes do site, com `category.id` = slug (não uuid).
 */
export async function getCategories(restaurantId: string): Promise<Category[]> {
  const supabase = createServerClient();

  const [catsRes, dishesRes, sectionsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, number, name, short_name, description, item_count, detail, gradient, featured, position, subcategories, image_path, full_width")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("position"),
    supabase
      .from("dishes")
      .select("id, slug, category_id, name, price, unit, description, long_description, subcategory, featured, original_price, image_path, position, badges")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("position"),
    supabase
      .from("dish_detail_sections")
      .select("dish_id, label, description, position")
      .order("position"),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (dishesRes.error) throw dishesRes.error;
  if (sectionsRes.error) throw sectionsRes.error;

  const sectionsByDish = new Map<string, DishDetailSection[]>();
  for (const s of sectionsRes.data ?? []) {
    const arr = sectionsByDish.get(s.dish_id) ?? [];
    arr.push({ label: s.label, description: s.description });
    sectionsByDish.set(s.dish_id, arr);
  }

  const dishesByCategoryUuid = new Map<string, Dish[]>();
  for (const d of dishesRes.data ?? []) {
    const sections = sectionsByDish.get(d.id) ?? [];
    const dish: Dish = {
      id: d.slug,
      name: d.name,
      price: d.price ?? "",
      unit: d.unit ?? undefined,
      description: d.description ?? undefined,
      featured: d.featured,
      subcategory: d.subcategory ?? undefined,
      originalPrice: d.original_price ?? undefined,
      tags: d.badges?.length ? d.badges : undefined,
      image: imageUrl(d.image_path),
    };
    if (d.long_description || sections.length > 0) {
      dish.details = {
        longDescription: d.long_description ?? undefined,
        sections,
      };
    }
    const arr = dishesByCategoryUuid.get(d.category_id) ?? [];
    arr.push(dish);
    dishesByCategoryUuid.set(d.category_id, arr);
  }

  return (catsRes.data ?? []).map((c): Category => ({
    id: c.slug,
    number: c.number,
    name: c.name,
    shortName: c.short_name ?? undefined,
    description: c.description,
    itemCount: c.item_count ?? "",
    detail: c.detail ?? "",
    featured: c.featured,
    subcategories: c.subcategories?.length ? c.subcategories : undefined,
    gradient: c.gradient,
    image: imageUrl(c.image_path),
    fullWidth: c.full_width,
    dishes: dishesByCategoryUuid.get(c.id) ?? [],
  }));
}

export async function getCategoryBySlug(restaurantId: string, slug: string): Promise<Category | undefined> {
  const all = await getCategories(restaurantId);
  return all.find((c) => c.id === slug);
}
