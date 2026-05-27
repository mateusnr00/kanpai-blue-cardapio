import Image from "next/image";
import { fs } from "@/lib/scale";
import { getRootButtons } from "@/lib/linktree-server";
import {
  backgroundStyle,
  fontFamilyCss,
  getLinktreeTheme,
  googleFontHref,
} from "@/lib/linktree-theme-server";
import { LinktreePills } from "@/components/LinktreePills";

export const metadata = {
  title: "Kanpai Blue",
  description: "Cardápio digital, reservas e contato, Kanpai Blue Goiânia.",
};

export const revalidate = 86400;

export default async function HomePage() {
  const [buttons, theme] = await Promise.all([getRootButtons(), getLinktreeTheme()]);
  const fontHref = googleFontHref(theme.fontFamily);

  return (
    <>
      {fontHref ? <link rel="stylesheet" href={fontHref} /> : null}
      <main
        style={{
          minHeight: "100vh",
          ...backgroundStyle(theme),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 22px 64px",
          gap: 28,
          fontFamily: fontFamilyCss(theme.fontFamily),
        }}
      >
        {theme.logoUrl ? (
          <Image
            src={theme.logoUrl}
            alt={theme.title}
            width={220}
            height={220}
            priority
            unoptimized
            style={{ width: 220, height: "auto", objectFit: "contain" }}
          />
        ) : null}

        <header style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
          <h1
            style={{
              margin: 0,
              fontSize: fs(28),
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: theme.textColor,
            }}
          >
            {theme.title}
          </h1>
          {theme.subtitle ? (
            <p
              style={{
                margin: 0,
                fontSize: fs(13),
                fontWeight: 400,
                color: theme.subtitleColor,
                letterSpacing: "-0.005em",
              }}
            >
              {theme.subtitle}
            </p>
          ) : null}
        </header>

        <LinktreePills buttons={buttons} theme={theme} />

        {theme.footer ? (
          <footer
            style={{
              marginTop: "auto",
              paddingTop: 24,
              fontSize: fs(10),
              color: theme.subtitleColor,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {theme.footer}
          </footer>
        ) : null}
      </main>
    </>
  );
}
