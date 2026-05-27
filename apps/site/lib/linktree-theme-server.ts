import { unstable_cache } from "next/cache";
import { createServerClient } from "./supabase-server";

export type LinktreeTheme = {
  title: string;
  subtitle: string;
  footer: string;
  logoUrl: string | null;
  bgKind: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgImageUrl: string | null;
  textColor: string;
  subtitleColor: string;
  buttonStyle: "outline" | "filled";
  buttonBorderColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonRadius: number;
  buttonShadow: boolean;
  fontFamily: string;
};

const FALLBACK_LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

const DEFAULT_THEME: LinktreeTheme = {
  title: "Kanpai Blue",
  subtitle: "Culinária japonesa contemporânea, Goiânia",
  footer: "© Kanpai Blue",
  logoUrl: FALLBACK_LOGO_URL,
  bgKind: "solid",
  bgColor: "#FAFAF8",
  bgGradientFrom: "#FAFAF8",
  bgGradientTo: "#EDE7D4",
  bgImageUrl: null,
  textColor: "#1a1a1a",
  subtitleColor: "#666666",
  buttonStyle: "outline",
  buttonBorderColor: "#1a1a1a",
  buttonBgColor: "#1a1a1a",
  buttonTextColor: "#FFFFFF",
  buttonRadius: 999,
  buttonShadow: false,
  fontFamily: "Inter",
};

async function getThemeImpl(): Promise<LinktreeTheme> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("linktree_theme")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error || !data) return DEFAULT_THEME;
    return {
      title: data.title,
      subtitle: data.subtitle,
      footer: data.footer,
      logoUrl: data.logo_url ?? FALLBACK_LOGO_URL,
      bgKind: (data.bg_kind as LinktreeTheme["bgKind"]) ?? "solid",
      bgColor: data.bg_color,
      bgGradientFrom: data.bg_gradient_from,
      bgGradientTo: data.bg_gradient_to,
      bgImageUrl: data.bg_image_url,
      textColor: data.text_color,
      subtitleColor: data.subtitle_color,
      buttonStyle: (data.button_style as LinktreeTheme["buttonStyle"]) ?? "outline",
      buttonBorderColor: data.button_border_color,
      buttonBgColor: data.button_bg_color,
      buttonTextColor: data.button_text_color,
      buttonRadius: data.button_radius,
      buttonShadow: data.button_shadow,
      fontFamily: data.font_family,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export const getLinktreeTheme = unstable_cache(getThemeImpl, ["linktree:theme"], {
  tags: ["linktree-theme"],
  revalidate: 86400,
});

export function backgroundStyle(theme: LinktreeTheme): React.CSSProperties {
  if (theme.bgKind === "image" && theme.bgImageUrl) {
    return {
      backgroundColor: theme.bgColor,
      backgroundImage: `url("${theme.bgImageUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  if (theme.bgKind === "gradient") {
    return {
      background: `linear-gradient(180deg, ${theme.bgGradientFrom} 0%, ${theme.bgGradientTo} 100%)`,
    };
  }
  return { background: theme.bgColor };
}

export function buttonStyle(theme: LinktreeTheme): React.CSSProperties {
  const shadow = theme.buttonShadow ? "0 4px 14px rgba(0,0,0,0.10)" : "none";
  if (theme.buttonStyle === "filled") {
    return {
      background: theme.buttonBgColor,
      color: theme.buttonTextColor,
      border: `1px solid ${theme.buttonBgColor}`,
      borderRadius: theme.buttonRadius,
      boxShadow: shadow,
    };
  }
  return {
    background: "transparent",
    color: theme.textColor,
    border: `1px solid ${theme.buttonBorderColor}`,
    borderRadius: theme.buttonRadius,
    boxShadow: shadow,
  };
}

const GOOGLE_FONTS = new Set([
  "DM Sans",
  "Poppins",
  "Montserrat",
  "Playfair Display",
]);

export function googleFontHref(family: string): string | null {
  if (!GOOGLE_FONTS.has(family)) return null;
  const param = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${param}:wght@400;500;600;700&display=swap`;
}

export function fontFamilyCss(family: string): string {
  if (family === "system-ui") return "system-ui, sans-serif";
  return `"${family}", sans-serif`;
}
