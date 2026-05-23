"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

type ItemInput = {
  kind: "entrada" | "principal" | "sobremesa";
  name: string;
  description: string;
  price: string | null;
};

function parseItems(formData: FormData, kind: ItemInput["kind"]): ItemInput[] {
  const count = Number(formData.get(`${kind}_count`) ?? "0");
  const out: ItemInput[] = [];
  for (let i = 0; i < count; i++) {
    const name = String(formData.get(`${kind}_${i}_name`) ?? "").trim();
    const description = String(formData.get(`${kind}_${i}_description`) ?? "").trim();
    const priceRaw = String(formData.get(`${kind}_${i}_price`) ?? "").trim();
    if (!name) continue;
    out.push({
      kind,
      name,
      description,
      price: kind === "sobremesa" && priceRaw ? priceRaw : null,
    });
  }
  return out;
}

async function syncItems(executivoId: string, items: ItemInput[]) {
  const supabase = createServerClient();
  await supabase.from("executivo_items").delete().eq("executivo_id", executivoId);
  if (items.length === 0) return;

  const counters: Record<ItemInput["kind"], number> = { entrada: 0, principal: 0, sobremesa: 0 };
  const rows = items.map((it) => ({
    executivo_id: executivoId,
    kind: it.kind,
    name: it.name,
    description: it.description,
    price: it.price,
    position: counters[it.kind]++,
  }));

  await supabase.from("executivo_items").insert(rows);
}

export async function toggleExecutivoActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("executivo_menus")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/executivos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteExecutivo(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("executivo_menus").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/executivos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createExecutivo(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const category_id = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const validity = String(formData.get("validity") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;

  if (!category_id || !name || !price || !format || !description) {
    return { error: "Categoria, nome, preço, formato e descrição obrigatórios." };
  }

  const { data: maxRow } = await supabase
    .from("executivo_menus")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("executivo_menus")
    .insert({
      category_id,
      name,
      price,
      format,
      description,
      validity,
      subcategory,
      position,
      active: true,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Falha ao criar." };

  const items = [
    ...parseItems(formData, "entrada"),
    ...parseItems(formData, "principal"),
    ...parseItems(formData, "sobremesa"),
  ];
  await syncItems(inserted.id, items);

  revalidatePath("/executivos");
  revalidatePath("/");
  redirect("/executivos");
}

export async function updateExecutivo(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const category_id = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const validity = String(formData.get("validity") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;

  if (!category_id || !name || !price || !format || !description) {
    return { error: "Categoria, nome, preço, formato e descrição obrigatórios." };
  }

  const { error } = await supabase
    .from("executivo_menus")
    .update({ category_id, name, price, format, description, validity, subcategory })
    .eq("id", id);

  if (error) return { error: error.message };

  const items = [
    ...parseItems(formData, "entrada"),
    ...parseItems(formData, "principal"),
    ...parseItems(formData, "sobremesa"),
  ];
  await syncItems(id, items);

  revalidatePath("/executivos");
  revalidatePath("/");
  redirect("/executivos");
}
