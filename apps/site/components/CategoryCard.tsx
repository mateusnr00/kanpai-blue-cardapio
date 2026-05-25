"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { PlaceholderImage } from "./PlaceholderImage";

export function CategoryCard({ category }: { category: Category }) {
  const isFeatured = !!category.featured;
  const borderStyle = isFeatured ? "1px solid var(--ink)" : "0.5px solid var(--ink-faint)";

  return (
    <motion.div whileTap={{ scale: 0.985 }} transition={{ duration: 0.15 }}>
      <Link
        href={`/${category.id}`}
        aria-label={`Abrir categoria ${category.name}`}
        style={{
          display: "block",
          background: "var(--bg-card)",
          border: borderStyle,
          borderRadius: 18,
          overflow: "hidden",
          color: "var(--ink)",
        }}
      >
        <PlaceholderImage
          gradient={category.gradient}
          number={category.number}
          dark={isFeatured}
          topRight={
            isFeatured ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  background: "var(--bg-card)",
                  border: "0.5px solid var(--ink-faint)",
                  borderRadius: 999,
                  color: "var(--ink)",
                  fontSize: 11,
                  lineHeight: 1,
                }}
                aria-hidden
              >
                ★
              </span>
            ) : undefined
          }
        />
        <div
          style={{
            borderTop: "0.5px solid var(--ink-faint)",
            padding: "16px 18px 18px",
          }}
        >
          <div
            style={{
              fontSize: fs(18),
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {category.name}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: fs(11),
              fontWeight: 400,
              color: "var(--ink-soft)",
              opacity: 0.95,
            }}
          >
            {category.description}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
