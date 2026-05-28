"use client";

import { motion } from "framer-motion";
import type { Category } from "@/lib/menu-types";
import { fs } from "@/lib/scale";
import { CategoryCard } from "./CategoryCard";

type Props = {
  parent: Category;
  children: Category[];
  restaurantId: string;
};

/**
 * Pagina de uma categoria PAI: mostra as filhas como cards (mesmo visual
 * da home), em vez de pratos. Ex.: "Carta de Vinhos" abre Tinto, Branco,
 * Rosé, Espumantes, Taça.
 */
export function CategoryHub({ parent, children, restaurantId }: Props) {
  return (
    <>
      <section style={{ padding: "32px 22px 18px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: fs(38),
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          {parent.name}
        </h1>
        {parent.description ? (
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: fs(12),
              fontWeight: 400,
              color: "var(--ink-soft)",
            }}
          >
            {parent.description}
          </p>
        ) : null}
      </section>

      <section style={{ padding: "8px 22px 32px" }}>
        <div
          className="category-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {children.map((child, idx) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.32, 0.72, 0, 1] }}
              style={child.fullWidth ? { gridColumn: "1 / -1" } : undefined}
            >
              <CategoryCard category={child} restaurantId={restaurantId} priority={idx === 0} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
