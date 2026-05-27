"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { DishImage } from "./DishImage";
import { CategorySlideshow } from "./CategorySlideshow";

type CategoryCardProps = {
  category: Category;
  restaurantId: string;
  /** Marca essa categoria como acima da dobra (LCP) — vira fetchpriority=high + preload. */
  priority?: boolean;
};

export function CategoryCard({ category, restaurantId, priority }: CategoryCardProps) {
  const isFeatured = !!category.featured;
  const borderStyle = isFeatured ? "1px solid var(--ink)" : "0.5px solid var(--ink-faint)";
  const aspect = isFeatured ? "16/9" : "1/1";
  const slideshow = category.slideshowImages ?? [];
  const hasSlideshow = slideshow.length > 0;

  const star = isFeatured ? (
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
  ) : undefined;

  return (
    <motion.div whileTap={{ scale: 0.985 }} transition={{ duration: 0.15 }}>
      <Link
        href={`/${restaurantId}/${category.id}`}
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
        {hasSlideshow ? (
          <CategorySlideshow
            images={slideshow}
            alt={category.name}
            aspect={aspect}
            dark={isFeatured}
            topLeftNumber={category.number}
            topRight={star}
            priority={priority}
          />
        ) : (
          <DishImage
            src={category.image}
            alt={category.name}
            gradient={category.gradient}
            number={category.number}
            aspect={aspect}
            dark={isFeatured}
            topRight={star}
            priority={priority}
          />
        )}
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
