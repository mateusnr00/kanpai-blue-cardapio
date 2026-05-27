"use server";

import { revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage-actions";
import { publicImageUrl } from "@/lib/storage";
import { triggerSiteRevalidate } from "@/lib/trigger-site-revalidate";
import { tags } from "@/lib/cache-tags";
import { logAudit } from "@/lib/audit";

export type SaveThemeInput = {
  title: string;
  subtitle: string;
  footer: string;
  bg_kind: "solid" | "gradient" | "image";
  bg_color: string;
  bg_gradient_from: string;
  bg_gradient_to: string;
  text_color: string;
  subtitle_color: string;
  button_style: "outline" | "filled";
  button_border_color: string;
  button_bg_color: string;
  button_text_color: string;
  button_radius: number;
  button_shadow: boolean;
  font_family: string;
  /** Marcadores de remoção via form */
  logo_remove: boolean;
  bg_image_remove: boolean;
};

/**
 * Recebe FormData: campos do tema + arquivos opcionais `logo_file` e
 * `bg_image_file`. Faz upload para o bucket dish-images sob theme/...
 * e grava a URL publica na tabela linktree_theme (linha 'default').
 */
export async function saveTheme(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  // Le tema atual pra saber os paths antigos de imagem (pra deletar)
  const { data: current } = await supabase
    .from("linktree_theme")
    .select("logo_url, bg_image_url")
    .eq("id", "default")
    .maybeSingle();

  const input: SaveThemeInput = {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    footer: String(formData.get("footer") ?? "").trim(),
    bg_kind: (String(formData.get("bg_kind") ?? "solid") as SaveThemeInput["bg_kind"]),
    bg_color: String(formData.get("bg_color") ?? "#FAFAF8"),
    bg_gradient_from: String(formData.get("bg_gradient_from") ?? "#FAFAF8"),
    bg_gradient_to: String(formData.get("bg_gradient_to") ?? "#EDE7D4"),
    text_color: String(formData.get("text_color") ?? "#1a1a1a"),
    subtitle_color: String(formData.get("subtitle_color") ?? "#666666"),
    button_style: (String(formData.get("button_style") ?? "outline") as SaveThemeInput["button_style"]),
    button_border_color: String(formData.get("button_border_color") ?? "#1a1a1a"),
    button_bg_color: String(formData.get("button_bg_color") ?? "#1a1a1a"),
    button_text_color: String(formData.get("button_text_color") ?? "#FFFFFF"),
    button_radius: Number(formData.get("button_radius") ?? 999),
    button_shadow: formData.get("button_shadow") === "on",
    font_family: String(formData.get("font_family") ?? "Inter"),
    logo_remove: String(formData.get("logo_remove") ?? "false") === "true",
    bg_image_remove: String(formData.get("bg_image_remove") ?? "false") === "true",
  };

  if (!input.title) return { error: "Título obrigatório." };

  // Processa logo
  let logoUrl: string | null = current?.logo_url ?? null;
  const logoFile = formData.get("logo_file");
  if (input.logo_remove) {
    logoUrl = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    const res = await uploadDishImageAction(`theme/logo-${Date.now().toString(36)}`, logoFile);
    if ("error" in res) return { error: res.error };
    logoUrl = publicImageUrl(res.path);
  }

  // Processa background image
  let bgImageUrl: string | null = current?.bg_image_url ?? null;
  const bgFile = formData.get("bg_image_file");
  if (input.bg_image_remove) {
    bgImageUrl = null;
  } else if (bgFile instanceof File && bgFile.size > 0) {
    const res = await uploadDishImageAction(`theme/bg-${Date.now().toString(36)}`, bgFile);
    if ("error" in res) return { error: res.error };
    bgImageUrl = publicImageUrl(res.path);
  }

  const { error } = await supabase
    .from("linktree_theme")
    .upsert(
      {
        id: "default",
        title: input.title,
        subtitle: input.subtitle,
        footer: input.footer,
        logo_url: logoUrl,
        bg_kind: input.bg_kind,
        bg_color: input.bg_color,
        bg_gradient_from: input.bg_gradient_from,
        bg_gradient_to: input.bg_gradient_to,
        bg_image_url: bgImageUrl,
        text_color: input.text_color,
        subtitle_color: input.subtitle_color,
        button_style: input.button_style,
        button_border_color: input.button_border_color,
        button_bg_color: input.button_bg_color,
        button_text_color: input.button_text_color,
        button_radius: input.button_radius,
        button_shadow: input.button_shadow,
        font_family: input.font_family,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    entityType: "linktree_theme",
    entityLabel: "Design",
  });

  revalidateTag(tags.linktree());
  revalidateTag("linktree-theme");
  triggerSiteRevalidate([tags.linktree(), "linktree-theme"]);
  return {};
}
