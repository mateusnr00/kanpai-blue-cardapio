import { createServerClient } from "@/lib/supabase-server";

export type ExecutivoRow = {
  id: string;
  category_id: string;
  name: string;
  price: string;
  format: string;
  description: string;
  validity: string | null;
  subcategory: string | null;
  position: number;
  active: boolean;
};

export type ExecutivoItemRow = {
  id: string;
  kind: "entrada" | "principal" | "sobremesa";
  name: string;
  description: string;
  price: string | null;
  position: number;
};

export async function listExecutivos(restaurantId: string): Promise<Array<ExecutivoRow & { category_name: string }>> {
  const supabase = createServerClient();
  const exRes = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .eq("restaurant_id", restaurantId)
    .order("position");
  if (exRes.error) throw exRes.error;

  const catRes = await supabase
    .from("categories")
    .select("id, name")
    .eq("restaurant_id", restaurantId);
  if (catRes.error) throw catRes.error;

  const catMap = new Map((catRes.data ?? []).map((c) => [c.id, c.name]));
  return (exRes.data ?? []).map((e) => ({ ...e, category_name: catMap.get(e.category_id) ?? "—" }));
}

export async function listExecutivosByCategory(categoryId: string): Promise<ExecutivoRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .eq("category_id", categoryId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export type ExecutivoWithItems = ExecutivoRow & { items: ExecutivoItemRow[] };

export async function listExecutivosWithItemsByCategory(
  categoryId: string,
): Promise<ExecutivoWithItems[]> {
  const supabase = createServerClient();
  const exRes = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .eq("category_id", categoryId)
    .order("position");
  if (exRes.error) throw exRes.error;
  const executivos = exRes.data ?? [];
  if (executivos.length === 0) return [];

  const ids = executivos.map((e) => e.id);
  const itemsRes = await supabase
    .from("executivo_items")
    .select("id, executivo_id, kind, name, description, price, position")
    .in("executivo_id", ids)
    .order("kind")
    .order("position");
  if (itemsRes.error) throw itemsRes.error;

  const itemsByExec = new Map<string, ExecutivoItemRow[]>();
  for (const it of itemsRes.data ?? []) {
    const arr = itemsByExec.get(it.executivo_id) ?? [];
    arr.push({
      id: it.id,
      kind: it.kind as ExecutivoItemRow["kind"],
      name: it.name,
      description: it.description,
      price: it.price,
      position: it.position,
    });
    itemsByExec.set(it.executivo_id, arr);
  }

  return executivos.map((e) => ({ ...e, items: itemsByExec.get(e.id) ?? [] }));
}

export async function getExecutivo(id: string): Promise<ExecutivoRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listExecutivoItems(executivoId: string): Promise<ExecutivoItemRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("executivo_items")
    .select("id, kind, name, description, price, position")
    .eq("executivo_id", executivoId)
    .order("kind")
    .order("position");
  if (error) throw error;
  return (data ?? []) as ExecutivoItemRow[];
}
