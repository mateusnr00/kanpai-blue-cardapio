"use client";

import type { ExecutivoMenu } from "@/lib/menu-data";
import { PlaceholderImage } from "./PlaceholderImage";

type Props = {
  menu: ExecutivoMenu;
  number: string;
  variant?: "blue" | "beige";
};

const FEATURED_BLUE = "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)";
const FEATURED_BEIGE = "linear-gradient(135deg, #C8BFA0 0%, #A89878 100%)";

function Section({
  label,
  items,
}: {
  label: string;
  items: { name: string; description: string; price?: string }[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <h4
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
        }}
      >
        {label}
      </h4>
      <ul
        style={{
          listStyle: "none",
          margin: "10px 0 0",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((item, idx) => (
          <li
            key={`${item.name}-${idx}`}
            style={{
              paddingTop: idx === 0 ? 0 : 10,
              borderTop: idx === 0 ? "none" : "0.5px solid var(--ink-ghost)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {item.name}
              </span>
              {item.price && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.price}
                </span>
              )}
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                fontWeight: 400,
                lineHeight: 1.45,
                color: "var(--ink-soft)",
              }}
            >
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExecutivoMenuCard({ menu, number, variant = "blue" }: Props) {
  const gradient = variant === "beige" ? FEATURED_BEIGE : FEATURED_BLUE;
  const isDark = variant !== "beige";

  return (
    <article
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--ink)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PlaceholderImage
        gradient={gradient}
        number={number}
        aspect="16/9"
        dark={isDark}
        topRight={
          <span
            style={{
              display: "inline-block",
              padding: "5px 9px",
              background: "var(--ink)",
              color: "#FAFAF8",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            EXECUTIVO
          </span>
        }
      />
      <div
        style={{
          borderTop: "0.5px solid var(--ink)",
          padding: "18px 20px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <h3
            style={{
              fontSize: 19,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {menu.name}
          </h3>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {menu.price}
          </span>
        </div>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: "0.05em",
            color: "var(--ink-soft)",
            textTransform: "uppercase",
          }}
        >
          {menu.format}
        </p>

        <p
          style={{
            margin: "12px 0 0",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5,
            color: "var(--ink-soft)",
          }}
        >
          {menu.description}
        </p>

        {menu.validity && (
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "var(--ink-soft)",
              opacity: 0.8,
            }}
          >
            {menu.validity}
          </p>
        )}

        <Section label="Entradas" items={menu.entradas} />
        <Section label="Principais" items={menu.principais} />
        {menu.sobremesas && menu.sobremesas.length > 0 && (
          <Section label="Sobremesas" items={menu.sobremesas} />
        )}
      </div>
    </article>
  );
}
