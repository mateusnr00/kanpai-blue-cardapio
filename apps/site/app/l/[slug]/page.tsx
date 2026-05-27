import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fs } from "@/lib/scale";
import { getSubLinktree } from "@/lib/linktree-server";
import {
  backgroundStyle,
  fontFamilyCss,
  getLinktreeTheme,
  googleFontHref,
} from "@/lib/linktree-theme-server";
import { LinktreePills } from "@/components/LinktreePills";

export const revalidate = 86400;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const tree = await getSubLinktree(params.slug);
  if (!tree) return { title: "Kanpai Blue" };
  return {
    title: `${tree.root.label} | Kanpai Blue`,
    description: `${tree.root.label}, Kanpai Blue.`,
  };
}

export default async function SubLinktreePage({ params }: Props) {
  const [tree, theme] = await Promise.all([getSubLinktree(params.slug), getLinktreeTheme()]);
  if (!tree) notFound();
  const fontHref = googleFontHref(theme.fontFamily);

  return (
    <>
      {fontHref ? <link rel="stylesheet" href={fontHref} /> : null}
      <style>{`html, body { padding: 0 !important; margin: 0 !important; background: ${theme.bgColor} !important; }`}</style>
      <main
        style={{
          minHeight: "100vh",
          ...backgroundStyle(theme),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 22px 64px",
          gap: 28,
          fontFamily: fontFamilyCss(theme.fontFamily),
        }}
      >
        <Link
          href="/"
          aria-label="Voltar"
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: theme.subtitleColor,
            fontSize: fs(12),
            textDecoration: "none",
          }}
        >
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden>
            <path
              d="M6.5 1L1.5 6L6.5 11"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar
        </Link>

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
            {tree.root.label}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: fs(13),
              fontWeight: 400,
              color: theme.subtitleColor,
              letterSpacing: "-0.005em",
            }}
          >
            Escolha a unidade
          </p>
        </header>

        <LinktreePills buttons={tree.children} theme={theme} />
      </main>
    </>
  );
}
