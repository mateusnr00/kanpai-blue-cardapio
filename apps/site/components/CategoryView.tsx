"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function subcatToId(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Empacota dishes em rows: featured ocupa fileira inteira, demais formam pares. */
function buildRows(
  dishes: Array<{ dish: Dish; globalIndex: number }>,
  featuredStartOffset: number,
): Row[] {
  const rows: Row[] = [];
  let buffer: { dish: Dish; number: string } | null = null;
  let featuredCount = featuredStartOffset;

  for (const { dish, globalIndex } of dishes) {
    const number = String(globalIndex + 1).padStart(2, "0");
    if (dish.featured) {
      if (buffer) {
        rows.push({ kind: "pair", left: buffer });
        buffer = null;
      }
      rows.push({ kind: "featured", dish, number, featuredIndex: featuredCount });
      featuredCount += 1;
      continue;
    }
    if (buffer) {
      rows.push({ kind: "pair", left: buffer, right: { dish, number } });
      buffer = null;
    } else {
      buffer = { dish, number };
    }
  }

  if (buffer) {
    rows.push({ kind: "pair", left: buffer });
  }

  return rows;
}

type Group = {
  /** null = grupo "Destaques / Topo", sem cabecalho de secao. */
  subcategory: string | null;
  dishes: Array<{ dish: Dish; globalIndex: number }>;
};

function groupDishes(dishes: Dish[], order: string[] | undefined): Group[] {
  const buckets = new Map<string | null, Array<{ dish: Dish; globalIndex: number }>>();
  dishes.forEach((dish, globalIndex) => {
    const key = dish.subcategory ?? null;
    const arr = buckets.get(key) ?? [];
    arr.push({ dish, globalIndex });
    buckets.set(key, arr);
  });

  const result: Group[] = [];
  if (buckets.has(null)) result.push({ subcategory: null, dishes: buckets.get(null)! });
  if (order && order.length > 0) {
    for (const sub of order) {
      if (buckets.has(sub)) result.push({ subcategory: sub, dishes: buckets.get(sub)! });
    }
  }
  // qualquer subcategoria fora da ordem declarada (defensivo)
  for (const [key, arr] of buckets) {
    if (key === null) continue;
    if (order?.includes(key)) continue;
    result.push({ subcategory: key, dishes: arr });
  }
  return result;
}

export function CategoryView({ category }: Props) {
  const isExecutivo = !!category.executivos && category.executivos.length > 0;
  const subcategories = category.subcategories ?? [];
  const hasSubcats = subcategories.length > 0;

  const groups = useMemo(
    () => (isExecutivo ? [] : groupDishes(category.dishes, subcategories)),
    [isExecutivo, category.dishes, subcategories],
  );

  // Analytics: registra abertura da categoria
  useEffect(() => {
    track({ event_type: "category_open", category_id: category.id });
  }, [category.id]);

  // Scroll-spy: rastreia qual secao esta visivel pra destacar o chip
  const [activeSubcat, setActiveSubcat] = useState<string>(subcategories[0] ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!hasSubcats) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const id = visible.target.getAttribute("data-subcat");
          if (id) setActiveSubcat(id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );
    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [hasSubcats, groups]);

  function jumpTo(subcat: string) {
    const el = sectionRefs.current[subcat];
    if (!el) return;
    const headerOffset = 110; // header + chips sticky
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - headerOffset;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

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

      {hasSubcats && !isExecutivo && (
        <SubcategoryChips
          options={subcategories}
          active={activeSubcat}
          onSelect={jumpTo}
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
          category.executivos!.map((menu, idx) => (
            <ExecutivoMenuCard
              key={menu.name}
              menu={menu}
              number={String(idx + 1).padStart(2, "0")}
              variant={idx % 2 === 0 ? "blue" : "beige"}
            />
          ))}

        {!isExecutivo &&
          groups.map((group) => {
            // featured offset = total de featured anteriores
            const featuredOffset = groups
              .slice(0, groups.indexOf(group))
              .reduce(
                (acc, g) => acc + g.dishes.filter(({ dish }) => dish.featured).length,
                0,
              );
            const rows = buildRows(group.dishes, featuredOffset);
            const subcatKey = group.subcategory ?? "_top";
            const anchorId = group.subcategory ? `subcat-${subcatToId(group.subcategory)}` : undefined;

            return (
              <section
                key={subcatKey}
                ref={(el) => {
                  if (group.subcategory) sectionRefs.current[group.subcategory] = el;
                }}
                data-subcat={group.subcategory ?? undefined}
                id={anchorId}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  scrollMarginTop: 120,
                }}
              >
                {group.subcategory ? (
                  <header
                    style={{
                      marginTop: 18,
                      paddingTop: 12,
                      borderTop: "0.5px solid var(--ink-ghost)",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: fs(20),
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        color: "var(--ink)",
                      }}
                    >
                      {group.subcategory}
                    </h2>
                    <span
                      style={{
                        fontSize: fs(10),
                        fontWeight: 400,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "var(--ink-soft)",
                      }}
                    >
                      {group.dishes.length} {group.dishes.length === 1 ? "item" : "itens"}
                    </span>
                  </header>
                ) : null}

                {rows.map((row, rowIdx) => {
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
              </section>
            );
          })}

        {!isExecutivo && groups.length === 0 && (
          <p
            style={{
              padding: "48px 8px",
              textAlign: "center",
              fontSize: fs(12),
              color: "var(--ink-soft)",
              letterSpacing: "0.05em",
            }}
          >
            Conteúdo em breve.
          </p>
        )}
      </section>
    </>
  );
}
