import { createServerClient } from "@/lib/supabase-server";

export type DishListRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string | null;
  image_path: string | null;
  active: boolean;
  position: number;
  subcategory: string | null;
  featured: boolean;
  is_component_only: boolean;
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_off_days: number[];
};

export type DishDetail = DishListRow & {
  category_id: string;
  unit: string | null;
  long_description: string | null;
  subcategory: string | null;
  featured: boolean;
  featured_label: string | null;
  original_price: string | null;
  badges: string[];
  is_component_only: boolean;
};

export type DishVariantRow = {
  id: string;
  name: string;
  price: string;
  image_path: string | null;
  position: number;
};

export async function listDishesByCategory(
  categoryId: string,
  opts: { includeComponentOnly?: boolean } = {},
): Promise<DishListRow[]> {
  const supabase = createServerClient();
  let q = supabase
    .from("dishes")
    .select("id, slug, name, description, price, image_path, active, position, subcategory, featured, is_component_only, schedule_start, schedule_end, schedule_off_days")
    .eq("category_id", categoryId);
  if (!opts.includeComponentOnly) q = q.eq("is_component_only", false);
  const { data, error } = await q.order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getDish(id: string): Promise<DishDetail | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dishes")
    .select(
      "id, slug, category_id, name, description, long_description, price, unit, subcategory, featured, featured_label, original_price, image_path, active, position, badges, is_component_only, schedule_start, schedule_end, schedule_off_days"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listVariants(dishId: string): Promise<DishVariantRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dish_variants")
    .select("id, name, price, image_path, position")
    .eq("dish_id", dishId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export type DishComponentRow = {
  childId: string;
  kind: "entrada" | "principal" | "sobremesa";
  position: number;
  /** Snapshot do dish child pra renderizar (nome + foto + preço sem nova query). */
  child: {
    id: string;
    slug: string;
    name: string;
    price: string | null;
    image_path: string | null;
    description: string | null;
  };
};

export async function listDishComponents(parentDishId: string): Promise<DishComponentRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dish_components")
    .select(
      "child_dish_id, kind, position, child:dishes!dish_components_child_dish_id_fkey(id, slug, name, price, image_path, description)"
    )
    .eq("parent_dish_id", parentDishId)
    .order("kind")
    .order("position");
  if (error) throw error;
  return (data ?? []).map((r) => {
    // supabase tipa join como possivel array; aqui sempre vem objeto unico
    const child = Array.isArray(r.child) ? r.child[0] : r.child;
    return {
      childId: r.child_dish_id,
      kind: r.kind as "entrada" | "principal" | "sobremesa",
      position: r.position,
      child: {
        id: child?.id ?? "",
        slug: child?.slug ?? "",
        name: child?.name ?? "",
        price: child?.price ?? null,
        image_path: child?.image_path ?? null,
        description: child?.description ?? null,
      },
    };
  });
}

/**
 * Lista pratos disponíveis pra escolher como componente, na mesma unidade.
 * Exclui o próprio parent (não pode se referenciar).
 */
export async function listAvailableComponentChoices(
  restaurantId: string,
  excludeDishId: string,
): Promise<Array<{ id: string; name: string; category: string; image_path: string | null; price: string | null }>> {
  const supabase = createServerClient();
  let query = supabase
    .from("dishes")
    .select(
      "id, name, price, image_path, category:categories!dishes_category_id_fkey(name)"
    )
    .eq("restaurant_id", restaurantId)
    .order("name");
  // So aplica o neq quando o id e um uuid valido (no fluxo de edit). No
  // fluxo de create o id ainda nao existe e passar string vazia quebra a
  // query (id e coluna uuid).
  if (excludeDishId) {
    query = query.neq("id", excludeDishId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((d) => {
    const cat = Array.isArray(d.category) ? d.category[0] : d.category;
    return {
      id: d.id,
      name: d.name,
      price: d.price,
      image_path: d.image_path,
      category: cat?.name ?? "",
    };
  });
}
