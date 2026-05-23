import { createServerClient } from "@/lib/supabase-server";

export type SectionRow = {
  id: string;
  label: string;
  description: string;
  position: number;
};

export async function listSections(dishId: string): Promise<SectionRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dish_detail_sections")
    .select("id, label, description, position")
    .eq("dish_id", dishId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}
