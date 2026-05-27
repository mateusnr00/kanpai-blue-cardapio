import { unstable_cache } from "next/cache";
import { createServerClient } from "./supabase-server";
import { tags } from "./cache-tags";
import type { Category, Dish, DishDetailSection, DishComponent } from "./menu-types";

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

async function listRestaurantsImpl(): Promise<RestaurantInfo[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, short_name, position")
    .eq("active", true)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, name: r.name, shortName: r.short_name }));
}

export const listRestaurants = unstable_cache(listRestaurantsImpl, ["restaurants:list"], {
  tags: [tags.restaurants()],
  revalidate: 86400,
});

async function getRestaurantByIdImpl(id: string): Promise<RestaurantInfo | null> {
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

export const getRestaurantById = unstable_cache(getRestaurantByIdImpl, ["restaurants:byId"], {
  tags: [tags.restaurants()],
  revalidate: 86400,
});

/**
 * Carrega o cardápio completo de uma unidade. Devolve `Category[]` no shape
 * usado pelos componentes do site, com `category.id` = slug (não uuid).
 *
 * Cacheado com tag `menu:<restaurantId>` — TTL longo (1 dia) porque o admin
 * dispara `revalidateTag` via webhook `/api/revalidate` após cada mutação.
 */
async function getCategoriesImpl(restaurantId: string): Promise<Category[]> {
  const supabase = createServerClient();

  const [catsRes, dishesRes] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, slug, number, name, short_name, description, item_count, detail, gradient, featured, position, subcategories, image_path, full_width, slideshow_image_paths, display_mode",
      )
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("position"),
    supabase
      .from("dishes")
      .select(
        "id, slug, category_id, name, price, unit, description, long_description, subcategory, featured, original_price, image_path, blur_data_url, position, badges, is_component_only",
      )
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("position"),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (dishesRes.error) throw dishesRes.error;

  // Sections/components sao filtrados em memoria pelo map dishByUuid abaixo.
  // Filtrar via .in([dishUuids]) explode o tamanho da URL (>16KB) quando o
  // restaurante tem 200+ pratos -> erro do Supabase.
  const [sectionsRes, componentsRes] = await Promise.all([
    supabase
      .from("dish_detail_sections")
      .select("dish_id, label, description, position")
      .order("position"),
    supabase
      .from("dish_components")
      .select("parent_dish_id, child_dish_id, kind, position")
      .order("position"),
  ]);

  if (sectionsRes.error) throw sectionsRes.error;
  if (componentsRes.error) throw componentsRes.error;

  const sectionsByDish = new Map<string, DishDetailSection[]>();
  for (const s of sectionsRes.data ?? []) {
    const arr = sectionsByDish.get(s.dish_id) ?? [];
    arr.push({ label: s.label, description: s.description });
    sectionsByDish.set(s.dish_id, arr);
  }

  // Indice dos dishes por uuid pra resolver components (snapshot do child)
  type DishRow = NonNullable<typeof dishesRes.data>[number];
  const dishByUuid = new Map<string, DishRow>();
  for (const d of dishesRes.data ?? []) dishByUuid.set(d.id, d);

  // Componentes agrupados por parent uuid
  const componentsByParent = new Map<string, DishComponent[]>();
  for (const c of componentsRes.data ?? []) {
    const child = dishByUuid.get(c.child_dish_id);
    if (!child) continue;
    const arr = componentsByParent.get(c.parent_dish_id) ?? [];
    arr.push({
      kind: c.kind as DishComponent["kind"],
      id: child.slug,
      name: child.name,
      price: child.price ?? undefined,
      description: child.description ?? undefined,
      image: imageUrl(child.image_path),
      blurDataUrl: child.blur_data_url ?? undefined,
    });
    componentsByParent.set(c.parent_dish_id, arr);
  }

  const dishesByCategoryUuid = new Map<string, Dish[]>();
  for (const d of dishesRes.data ?? []) {
    // pratos marcados como componente-only nao aparecem na listagem da categoria
    // (continuam disponiveis via componentsByParent quando referenciados)
    if (d.is_component_only) continue;
    const sections = sectionsByDish.get(d.id) ?? [];
    const components = componentsByParent.get(d.id);
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
      blurDataUrl: d.blur_data_url ?? undefined,
    };
    if (d.long_description || sections.length > 0) {
      dish.details = {
        longDescription: d.long_description ?? undefined,
        sections,
      };
    }
    if (components && components.length > 0) {
      dish.components = components;
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
    slideshowImages: (c.slideshow_image_paths ?? [])
      .map((p) => imageUrl(p))
      .filter((u): u is string => Boolean(u)),
    fullWidth: c.full_width,
    displayMode: (c.display_mode === "list" ? "list" : "grid") as "grid" | "list",
    dishes: dishesByCategoryUuid.get(c.id) ?? [],
  }));
}

export async function getCategories(restaurantId: string): Promise<Category[]> {
  const cached = unstable_cache(
    () => getCategoriesImpl(restaurantId),
    [`menu:categories:${restaurantId}`],
    { tags: [tags.menu(restaurantId)], revalidate: 86400 }
  );
  return cached();
}

export async function getCategoryBySlug(
  restaurantId: string,
  slug: string
): Promise<Category | undefined> {
  const all = await getCategories(restaurantId);
  return all.find((c) => c.id === slug);
}
