import { createServerClient } from "./supabase-server";
import type { Category, Dish, DishDetailSection, ExecutivoMenu } from "./menu-types";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/dish-images/`;

function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${STORAGE_BASE}${path}`;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();

  const [catsRes, dishesRes, sectionsRes, execMenusRes, execItemsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, number, name, short_name, description, item_count, detail, gradient, featured, position, subcategories")
      .eq("active", true)
      .order("position"),
    supabase
      .from("dishes")
      .select("id, slug, category_id, name, price, unit, description, long_description, subcategory, featured, original_price, image_path, position, badges")
      .eq("active", true)
      .order("position"),
    supabase
      .from("dish_detail_sections")
      .select("dish_id, label, description, position")
      .order("position"),
    supabase
      .from("executivo_menus")
      .select("id, category_id, name, price, format, description, validity, subcategory, position")
      .eq("active", true)
      .order("position"),
    supabase
      .from("executivo_items")
      .select("executivo_id, kind, name, description, price, position")
      .order("position"),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (dishesRes.error) throw dishesRes.error;
  if (sectionsRes.error) throw sectionsRes.error;
  if (execMenusRes.error) throw execMenusRes.error;
  if (execItemsRes.error) throw execItemsRes.error;

  const sectionsByDish = new Map<string, DishDetailSection[]>();
  for (const s of sectionsRes.data ?? []) {
    const arr = sectionsByDish.get(s.dish_id) ?? [];
    arr.push({ label: s.label, description: s.description });
    sectionsByDish.set(s.dish_id, arr);
  }

  const dishesByCategory = new Map<string, Dish[]>();
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
    const arr = dishesByCategory.get(d.category_id) ?? [];
    arr.push(dish);
    dishesByCategory.set(d.category_id, arr);
  }

  type ExecItem = { kind: "entrada" | "principal" | "sobremesa"; name: string; description: string; price: string | null };
  const itemsByExec = new Map<string, ExecItem[]>();
  for (const it of execItemsRes.data ?? []) {
    const arr = itemsByExec.get(it.executivo_id) ?? [];
    arr.push({ kind: it.kind as ExecItem["kind"], name: it.name, description: it.description, price: it.price });
    itemsByExec.set(it.executivo_id, arr);
  }

  const execsByCategory = new Map<string, ExecutivoMenu[]>();
  for (const ex of execMenusRes.data ?? []) {
    const items = itemsByExec.get(ex.id) ?? [];
    const exec: ExecutivoMenu = {
      name: ex.name,
      price: ex.price,
      format: ex.format,
      description: ex.description,
      validity: ex.validity ?? undefined,
      subcategory: ex.subcategory ?? undefined,
      entradas: items.filter((it) => it.kind === "entrada").map((it) => ({ name: it.name, description: it.description })),
      principais: items.filter((it) => it.kind === "principal").map((it) => ({ name: it.name, description: it.description })),
    };
    const sobremesas = items.filter((it) => it.kind === "sobremesa");
    if (sobremesas.length > 0) {
      exec.sobremesas = sobremesas.map((it) => ({ name: it.name, description: it.description, price: it.price ?? "" }));
    }
    const arr = execsByCategory.get(ex.category_id) ?? [];
    arr.push(exec);
    execsByCategory.set(ex.category_id, arr);
  }

  return (catsRes.data ?? []).map((c): Category => {
    const cat: Category = {
      id: c.id,
      number: c.number,
      name: c.name,
      shortName: c.short_name ?? undefined,
      description: c.description,
      itemCount: c.item_count ?? "",
      detail: c.detail ?? "",
      featured: c.featured,
      subcategories: c.subcategories?.length ? c.subcategories : undefined,
      gradient: c.gradient,
      dishes: dishesByCategory.get(c.id) ?? [],
    };
    const execs = execsByCategory.get(c.id);
    if (execs && execs.length > 0) cat.executivos = execs;
    return cat;
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await getCategories();
  return all.find((c) => c.id === slug);
}
