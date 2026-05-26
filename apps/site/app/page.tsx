import Image from "next/image";
import Link from "next/link";
import { fs } from "@/lib/scale";

export const metadata = {
  title: "Kanpai Blue",
  description: "Cardápio digital, reservas e contato — Kanpai Blue Goiânia.",
};

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type LinkItem = {
  label: string;
  href: string;
  highlight?: boolean;
  external?: boolean;
  disabled?: boolean;
};

const LINKS: LinkItem[] = [
  { label: "Cardápio · Flamboyant", href: "/flamboyant", highlight: true },
  { label: "Cardápio · Goiânia Shopping", href: "/goianiashopping", highlight: true },
  { label: "Reservas", href: "#", disabled: true },
  { label: "Fale conosco", href: "#", disabled: true },
  { label: "Localização", href: "#", disabled: true },
  { label: "Avalie-nos", href: "#", disabled: true },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-warm)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 22px 64px",
        gap: 28,
      }}
    >
      <Image
        src={LOGO_URL}
        alt="Kanpai Blue"
        width={220}
        height={220}
        priority
        unoptimized
        style={{ width: 220, height: "auto", objectFit: "contain" }}
      />

      <header style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontSize: fs(28),
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          Kanpai Blue
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: fs(13),
            fontWeight: 400,
            color: "var(--ink-soft)",
            letterSpacing: "-0.005em",
          }}
        >
          Culinária japonesa contemporânea · Goiânia
        </p>
      </header>

      <nav
        aria-label="Atalhos"
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 4,
        }}
      >
        {LINKS.map((link) => {
          const baseStyle = {
            display: "block",
            width: "100%",
            padding: "16px 22px",
            borderRadius: 999,
            border: "1px solid var(--ink)",
            background: "transparent",
            color: "var(--ink)",
            fontSize: fs(14),
            fontWeight: 500,
            letterSpacing: "-0.005em",
            textAlign: "center" as const,
            textDecoration: "none",
            transition: "background 160ms ease, color 160ms ease, transform 120ms ease",
          };

          if (link.disabled) {
            return (
              <span
                key={link.label}
                aria-disabled
                style={{
                  ...baseStyle,
                  opacity: 0.45,
                  cursor: "not-allowed",
                  borderStyle: "dashed",
                }}
              >
                {link.label}
              </span>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              className="kanpai-link-pill"
              style={baseStyle}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <footer
        style={{
          marginTop: "auto",
          paddingTop: 24,
          fontSize: fs(10),
          color: "var(--ink-soft)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        © Kanpai Blue
      </footer>
    </main>
  );
}
