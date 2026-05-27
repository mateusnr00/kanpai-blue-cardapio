import { unstable_cache } from "next/cache";
import { createServerClient } from "./supabase-server";
import { tags } from "./cache-tags";
import { isScheduleActive } from "./schedule";
import type { Category, Dish, DishDetailSection, DishComponent } from "./menu-types";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/dish-images/`;

function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${STORAGE_BASE}${path}`;
}

function parseSubcatModes(raw: unknown): Record<string, "grid" | "list"> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, "grid" | "list"> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === "list" || v === "grid") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export type RestaurantInfo = {
  id: string;
  name: string;
  shortName: string;
};

export type RestaurantAnnouncement = {
  imageUrl: string;
};

async function getRestaurantAnnouncementImpl(id: string): Promise<RestaurantAnnouncement | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("announcement_active, announcement_image_path")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  const row = data as { announcement_active?: boolean; announcement_image_path?: string | null } | null;
  if (!row?.announcement_active || !row.announcement_image_path) return null;
  const url = imageUrl(row.announcement_image_path);
  if (!url) return null;
  return { imageUrl: url };
}

export const getRestaurantAnnouncement = unstable_cache(
  getRestaurantAnnouncementImpl,
  ["restaurants:announcement"],
  { tags: [tags.restaurants()], revalidate: 86400 },
);

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
        "id, slug, number, name, short_name, description, item_count, detail, gradient, featured, position, subcategories, subcategory_display_modes, image_path, full_width, slideshow_image_paths, display_mode, schedule_start, schedule_end, schedule_off_days",
      )
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("position"),
    supabase
      .from("dishes")
      .select(
        "id, slug, category_id, name, price, unit, description, long_description, subcategory, featured, original_price, image_path, blur_data_url, position, badges, is_component_only, schedule_start, schedule_end, schedule_off_days",
      )
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
      .order("position"),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (dishesRes.error) throw dishesRes.error;

  const dishUuids = (dishesRes.data ?? []).map((d) => d.id);

  // Chunk pra evitar Headers Overflow Error: ".in('id', [400+ uuids])" estoura
  // 16KB no URL do PostgREST. Quebramos em batches de 80 ids (~3KB cada).
  const CHUNK = 80;
  function chunkArray<T>(arr: T[], size: number): T[][] {
    if (arr.length === 0) return [];
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
  const chunks = chunkArray(dishUuids, CHUNK);

  const sectionsBatches = await Promise.all(
    chunks.map((c) =>
      supabase
        .from("dish_detail_sections")
        .select("dish_id, label, description, position")
        .in("dish_id", c)
        .order("position"),
    ),
  );
  const componentsBatches = await Promise.all(
    chunks.map((c) =>
      supabase
        .from("dish_components")
        .select("parent_dish_id, child_dish_id, kind, position")
        .in("parent_dish_id", c)
        .order("position"),
    ),
  );

  type SectionRow = { dish_id: string; label: string; description: string; position: number };
  type ComponentRow = { parent_dish_id: string; child_dish_id: string; kind: string; position: number };
  const sectionsData: SectionRow[] = [];
  for (const r of sectionsBatches) {
    if (r.error) throw r.error;
    sectionsData.push(...((r.data ?? []) as SectionRow[]));
  }
  const componentsData: ComponentRow[] = [];
  for (const r of componentsBatches) {
    if (r.error) throw r.error;
    componentsData.push(...((r.data ?? []) as ComponentRow[]));
  }

  const sectionsByDish = new Map<string, DishDetailSection[]>();
  for (const s of sectionsData) {
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
  for (const c of componentsData) {
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
      scheduleStart: d.schedule_start ?? null,
      scheduleEnd: d.schedule_end ?? null,
      scheduleOffDays: d.schedule_off_days ?? null,
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
    subcategoryDisplayModes: parseSubcatModes((c as { subcategory_display_modes?: unknown }).subcategory_display_modes),
    scheduleStart: c.schedule_start ?? null,
    scheduleEnd: c.schedule_end ?? null,
    scheduleOffDays: c.schedule_off_days ?? null,
    dishes: dishesByCategoryUuid.get(c.id) ?? [],
  }));
}

function applyScheduleFilter(categories: Category[]): Category[] {
  const now = new Date();
  const fits = (s: { scheduleStart?: string | null; scheduleEnd?: string | null; scheduleOffDays?: number[] | null }) =>
    isScheduleActive(
      {
        schedule_start: s.scheduleStart ?? null,
        schedule_end: s.scheduleEnd ?? null,
        schedule_off_days: s.scheduleOffDays ?? null,
      },
      now,
    );
  return categories
    .filter(fits)
    .map((c) => ({ ...c, dishes: c.dishes.filter(fits) }));
}

export async function getCategories(restaurantId: string): Promise<Category[]> {
  const cached = unstable_cache(
    () => getCategoriesImpl(restaurantId),
    [`menu:categories:${restaurantId}`],
    { tags: [tags.menu(restaurantId)], revalidate: 86400 }
  );
  const all = await cached();
  // Filtro de programacao roda em runtime, fora do cache, pra refletir
  // a janela do dia atual sem precisar invalidar cache toda hora.
  return applyScheduleFilter(all);
}

export async function getCategoryBySlug(
  restaurantId: string,
  slug: string
): Promise<Category | undefined> {
  const all = await getCategories(restaurantId);
  return all.find((c) => c.id === slug);
}
