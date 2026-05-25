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

export async function listExecutivos(): Promise<Array<ExecutivoRow & { category_name: string }>> {
  const supabase = createServerClient();
  const exRes = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .order("position");
  if (exRes.error) throw exRes.error;

  const catRes = await supabase.from("categories").select("id, name");
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
