"use client";

import type { Dish, ExecutivoMenu } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { PlaceholderImage } from "./PlaceholderImage";
import { DishCardSmall } from "./DishCardSmall";

type Props = {
  menu: ExecutivoMenu;
  number: string;
  variant?: "blue" | "beige";
  restaurantId: string;
};

const FEATURED_BLUE = "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)";
const FEATURED_BEIGE = "linear-gradient(135deg, #C8BFA0 0%, #A89878 100%)";

type ExecItem = { name: string; description: string; price?: string };

function toDish(item: ExecItem, prefix: string, idx: number): Dish {
  return {
    id: `${prefix}-${idx}`,
    name: item.name,
    price: item.price ?? "",
    description: item.description,
  };
}

function Section({
  label,
  items,
  prefix,
  startIndex,
  restaurantId,
}: {
  label: string;
  items: ExecItem[];
  prefix: string;
  startIndex: number;
  restaurantId: string;
}) {
  if (!items || items.length === 0) return null;

  // Rows de 2
  const rows: ExecItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <div style={{ marginTop: 26 }}>
      <h4
        style={{
          margin: 0,
          fontSize: fs(10),
          fontWeight: 500,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
        }}
      >
        {label}
      </h4>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={`${prefix}-row-${rowIdx}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              alignItems: "start",
            }}
          >
            {row.map((item, colIdx) => {
              const flatIdx = rowIdx * 2 + colIdx;
              const overallIdx = startIndex + flatIdx;
              return (
                <DishCardSmall
                  key={`${prefix}-${flatIdx}`}
                  dish={toDish(item, prefix, flatIdx)}
                  number={String(overallIdx + 1).padStart(2, "0")}
                  gradientIndex={overallIdx}
                  restaurantId={restaurantId}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExecutivoMenuCard({ menu, number, variant = "blue", restaurantId }: Props) {
  const gradient = variant === "beige" ? FEATURED_BEIGE : FEATURED_BLUE;
  const isDark = variant !== "beige";

  const entradasCount = menu.entradas?.length ?? 0;
  const principaisStart = entradasCount;
  const sobremesasStart = principaisStart + (menu.principais?.length ?? 0);

  return (
    <article
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--ink)",
        borderRadius: 18,
        overflow: "hidden",
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
              fontSize: fs(9),
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              lineHeight: 1,
              borderRadius: 999,
            }}
          >
            EXECUTIVO
          </span>
        }
      />
      <div
        style={{
          borderTop: "0.5px solid var(--ink)",
          padding: "18px 20px 24px",
        }}
      >
        <div className="dish-head" style={{ gap: 12 }}>
          <h3
            className="dish-head__name"
            style={{
              fontSize: fs(19),
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {menu.name}
          </h3>
          <span
            className="dish-head__price"
            style={{
              fontSize: fs(14),
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
            fontSize: fs(11),
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
            fontSize: fs(11),
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
              fontSize: fs(10),
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "var(--ink-soft)",
              opacity: 0.8,
            }}
          >
            {menu.validity}
          </p>
        )}

        <Section
          label="Entradas"
          items={menu.entradas}
          prefix={`${menu.name}-ent`}
          startIndex={0}
          restaurantId={restaurantId}
        />
        <Section
          label="Principais"
          items={menu.principais}
          prefix={`${menu.name}-pri`}
          startIndex={principaisStart}
          restaurantId={restaurantId}
        />
        {menu.sobremesas && menu.sobremesas.length > 0 && (
          <Section
            label="Sobremesas"
            items={menu.sobremesas}
            prefix={`${menu.name}-sob`}
            startIndex={sobremesasStart}
            restaurantId={restaurantId}
          />
        )}
      </div>
    </article>
  );
}
