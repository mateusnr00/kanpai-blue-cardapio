"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { track } from "@/lib/analytics";
import { SubcategoryChips } from "./SubcategoryChips";
import { DishCardSmall } from "./DishCardSmall";
import { DishCardFeatured } from "./DishCardFeatured";
import { ExecutivoMenuCard } from "./ExecutivoMenuCard";

type Props = {
  category: Category;
};

type Row =
  | { kind: "featured"; dish: Dish; number: string; featuredIndex: number }
  | { kind: "pair"; left: { dish: Dish; number: string }; right?: { dish: Dish; number: string } };

function buildRows(dishes: Dish[]): Row[] {
  const rows: Row[] = [];
  let buffer: { dish: Dish; number: string } | null = null;
  let featuredCount = 0;

  dishes.forEach((dish, idx) => {
    const number = String(idx + 1).padStart(2, "0");
    if (dish.featured) {
      if (buffer) {
        rows.push({ kind: "pair", left: buffer });
        buffer = null;
      }
      rows.push({ kind: "featured", dish, number, featuredIndex: featuredCount });
      featuredCount += 1;
      return;
    }
    if (buffer) {
      rows.push({ kind: "pair", left: buffer, right: { dish, number } });
      buffer = null;
    } else {
      buffer = { dish, number };
    }
  });

  if (buffer) {
    rows.push({ kind: "pair", left: buffer });
  }

  return rows;
}

export function CategoryView({ category }: Props) {
  const [activeSubcat, setActiveSubcat] = useState<string>(
    category.subcategories?.[0] ?? "Todos",
  );

  useEffect(() => {
    track({ event_type: "category_open", category_id: category.id });
  }, [category.id]);

  const filteredDishes = useMemo(() => {
    if (!activeSubcat || activeSubcat === "Todos") return category.dishes;
    return category.dishes.filter(
      (d) => !d.subcategory || d.subcategory === activeSubcat,
    );
  }, [category.dishes, activeSubcat]);

  const rows = useMemo(() => buildRows(filteredDishes), [filteredDishes]);

  const isExecutivo = !!category.executivos && category.executivos.length > 0;

  const filteredExecutivos = useMemo(() => {
    if (!isExecutivo) return [] as NonNullable<typeof category.executivos>;
    if (!activeSubcat || activeSubcat === "Todos") return category.executivos!;
    return category.executivos!.filter(
      (m) => !m.subcategory || m.subcategory === activeSubcat,
    );
  }, [isExecutivo, category.executivos, activeSubcat]);

  return (
    <>
      <section style={{ padding: "32px 22px 18px" }}>
        <p
          style={{
            margin: 0,
            fontSize: fs(11),
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          Categoria · {category.number}
        </p>
        <h1
          style={{
            marginTop: 14,
            marginBottom: 0,
            fontSize: fs(38),
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          {category.name}
        </h1>
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: fs(12),
            fontWeight: 400,
            color: "var(--ink-soft)",
          }}
        >
          {category.itemCount} · {category.detail}
        </p>
      </section>

      {category.subcategories && category.subcategories.length > 1 && (
        <SubcategoryChips
          options={category.subcategories}
          onChange={setActiveSubcat}
        />
      )}

      <section
        style={{
          padding: "16px 22px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {isExecutivo &&
          filteredExecutivos.map((menu, idx) => {
            // Mantém numeração estável baseada na posição original
            const originalIdx = category.executivos!.findIndex(
              (m) => m.name === menu.name,
            );
            return (
              <ExecutivoMenuCard
                key={menu.name}
                menu={menu}
                number={String(originalIdx + 1).padStart(2, "0")}
                variant={originalIdx % 2 === 0 ? "blue" : "beige"}
              />
            );
          })}

        {isExecutivo && filteredExecutivos.length === 0 && (
          <p
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontSize: fs(12),
              color: "var(--ink-soft)",
            }}
          >
            Nenhum menu nesta seleção.
          </p>
        )}

        {!isExecutivo &&
          rows.map((row, rowIdx) => {
            if (row.kind === "featured") {
              return (
                <DishCardFeatured
                  key={`f-${row.dish.id}`}
                  dish={row.dish}
                  number={row.number}
                  variant={row.featuredIndex % 2 === 0 ? "blue" : "beige"}
                />
              );
            }
            return (
              <div
                key={`p-${row.left.dish.id}-${rowIdx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                  alignItems: "start",
                }}
              >
                <DishCardSmall
                  dish={row.left.dish}
                  number={row.left.number}
                  gradientIndex={rowIdx}
                />
                {row.right && (
                  <DishCardSmall
                    dish={row.right.dish}
                    number={row.right.number}
                    gradientIndex={rowIdx + 1}
                  />
                )}
              </div>
            );
          })}

        {!isExecutivo && rows.length === 0 && (
          <p
            style={{
              padding: "48px 8px",
              textAlign: "center",
              fontSize: fs(12),
              color: "var(--ink-soft)",
              letterSpacing: "0.05em",
            }}
          >
            {category.dishes.length === 0
              ? "Conteúdo em breve."
              : "Nenhum prato nesta subcategoria."}
          </p>
        )}
      </section>
    </>
  );
}
