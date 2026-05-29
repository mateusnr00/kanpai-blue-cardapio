"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { logAudit } from "@/lib/audit";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      // eslint-disable-next-line no-misleading-character-class
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "qr"
  );
}

export async function createQrCode(formData: FormData): Promise<{ error?: string }> {
  const label = String(formData.get("label") ?? "").trim();
  const target = String(formData.get("target_path") ?? "").trim();
  if (!label) return { error: "Informe um nome pro QR." };
  if (!target.startsWith("/")) return { error: "Destino inválido." };

  const restaurantId = getActiveRestaurantId();
  const supabase = createServerClient();

  const base = slugify(label);
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase
      .from("qr_codes")
      .insert({ restaurant_id: restaurantId, slug, label, target_path: target });
    if (!error) {
      await logAudit({
        action: "create",
        entityType: "qr_code",
        entityId: slug,
        entityLabel: label,
        restaurantId,
        details: { target_path: target },
      });
      revalidatePath("/qrcode");
      return {};
    }
    // 23505 = unique_violation no slug → tenta com sufixo curto
    if (error.code === "23505") {
      slug = `${base}-${Math.random().toString(36).slice(2, 5)}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Não consegui gerar um endereço único — tente outro nome." };
}

export async function deleteQrCode(id: string): Promise<{ error?: string }> {
  const restaurantId = getActiveRestaurantId();
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("qr_codes")
    .select("label")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("qr_codes").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAudit({
    action: "delete",
    entityType: "qr_code",
    entityId: id,
    entityLabel: existing?.label ?? null,
    restaurantId,
  });
  revalidatePath("/qrcode");
  return {};
}
