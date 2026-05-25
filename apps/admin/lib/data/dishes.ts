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
};

export type DishDetail = DishListRow & {
  category_id: string;
  unit: string | null;
  long_description: string | null;
  subcategory: string | null;
  featured: boolean;
  original_price: string | null;
  badges: string[];
};

export type DishVariantRow = {
  id: string;
  name: string;
  price: string;
  image_path: string | null;
  position: number;
};

export async function listDishesByCategory(categoryId: string): Promise<DishListRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dishes")
    .select("id, slug, name, description, price, image_path, active, position, subcategory, featured")
    .eq("category_id", categoryId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getDish(id: string): Promise<DishDetail | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dishes")
    .select(
      "id, slug, category_id, name, description, long_description, price, unit, subcategory, featured, original_price, image_path, active, position, badges"
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
