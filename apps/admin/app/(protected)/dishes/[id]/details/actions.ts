"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

type SectionInput = { label: string; description: string };

function parseSections(formData: FormData): SectionInput[] {
  const count = Number(formData.get("sections_count") ?? "0");
  const out: SectionInput[] = [];
  for (let i = 0; i < count; i++) {
    const label = String(formData.get(`section_${i}_label`) ?? "").trim();
    const description = String(formData.get(`section_${i}_description`) ?? "").trim();
    if (label && description) out.push({ label, description });
  }
  return out;
}

export async function saveDishDetails(
  dishId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const longDescription = String(formData.get("long_description") ?? "").trim() || null;

  const { error: updErr } = await supabase
    .from("dishes")
    .update({ long_description: longDescription, updated_at: new Date().toISOString() })
    .eq("id", dishId);
  if (updErr) return { error: updErr.message };

  await supabase.from("dish_detail_sections").delete().eq("dish_id", dishId);

  const sections = parseSections(formData);
  if (sections.length > 0) {
    const rows = sections.map((s, i) => ({
      dish_id: dishId,
      label: s.label,
      description: s.description,
      position: i,
    }));
    const { error: insErr } = await supabase.from("dish_detail_sections").insert(rows);
    if (insErr) return { error: insErr.message };
  }

  revalidatePath(`/dishes/${dishId}`);
  revalidatePath(`/dishes/${dishId}/details`);
  revalidatePath("/");
  return {};
}
