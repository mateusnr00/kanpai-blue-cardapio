import Link from "next/link";
import { fs } from "@/lib/scale";
import type { LinktreeButton } from "@/lib/linktree-server";

type Props = {
  buttons: LinktreeButton[];
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function LinktreePills({ buttons }: Props) {
  return (
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
      {buttons.map((b) => {
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

        // Sem href e sem child_slug: placeholder dashed (em breve)
        if (!b.href && !b.childSlug) {
          return (
            <span
              key={b.id}
              aria-disabled
              style={{ ...baseStyle, opacity: 0.45, cursor: "not-allowed", borderStyle: "dashed" }}
            >
              {b.label}
            </span>
          );
        }

        const href = b.href ?? `/l/${b.childSlug}`;
        const external = b.href ? isExternal(b.href) : false;

        return (
          <Link
            key={b.id}
            href={href}
            className="kanpai-link-pill"
            style={baseStyle}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {b.label}
          </Link>
        );
      })}
    </nav>
  );
}
