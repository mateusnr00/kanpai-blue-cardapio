import Image from "next/image";
import Link from "next/link";
import { fs } from "@/lib/scale";

export const metadata = {
  title: "Reservas · Kanpai Blue",
  description: "Reserve sua mesa no Kanpai Blue Flamboyant ou Goiânia Shopping.",
};

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type LinkItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

const LINKS: LinkItem[] = [
  {
    label: "Reservar · Flamboyant",
    href: "https://reservation-widget.tagme.com.br/smartlink/6476426688f854004fe61654",
  },
  {
    label: "Reservar · Goiânia Shopping",
    href: "#",
    disabled: true,
  },
];

export default function ReservasPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-warm)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 22px 64px",
        gap: 28,
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
          color: "var(--ink-soft)",
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
          Reservas
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
          Escolha a unidade
        </p>
      </header>

      <nav
        aria-label="Reservas por unidade"
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
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
