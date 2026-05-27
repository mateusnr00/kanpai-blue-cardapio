import { createServerClient } from "@/lib/supabase-server";

export type LinktreeThemeRow = {
  title: string;
  subtitle: string;
  footer: string;
  logo_url: string | null;
  bg_kind: "solid" | "gradient" | "image";
  bg_color: string;
  bg_gradient_from: string;
  bg_gradient_to: string;
  bg_image_url: string | null;
  text_color: string;
  subtitle_color: string;
  button_style: "outline" | "filled";
  button_border_color: string;
  button_bg_color: string;
  button_text_color: string;
  button_radius: number;
  button_shadow: boolean;
  font_family: string;
};

export const DEFAULT_THEME: LinktreeThemeRow = {
  title: "Kanpai Blue",
  subtitle: "Culinária japonesa contemporânea, Goiânia",
  footer: "© Kanpai Blue",
  logo_url: null,
  bg_kind: "solid",
  bg_color: "#FAFAF8",
  bg_gradient_from: "#FAFAF8",
  bg_gradient_to: "#EDE7D4",
  bg_image_url: null,
  text_color: "#1a1a1a",
  subtitle_color: "#666666",
  button_style: "outline",
  button_border_color: "#1a1a1a",
  button_bg_color: "#1a1a1a",
  button_text_color: "#FFFFFF",
  button_radius: 999,
  button_shadow: false,
  font_family: "Inter",
};

export async function getTheme(): Promise<LinktreeThemeRow> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("linktree_theme")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (!data) return DEFAULT_THEME;
  return data as LinktreeThemeRow;
}
