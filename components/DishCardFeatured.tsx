"use client";

import type { Dish } from "@/lib/menu-data";
import { PlaceholderImage } from "./PlaceholderImage";

const FEATURED_BLUE = "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)";
const FEATURED_BEIGE = "linear-gradient(135deg, #C8BFA0 0%, #A89878 100%)";

type Props = {
  dish: Dish;
  number: string;
};

export function DishCardFeatured({ dish, number }: Props) {
  const gradient = dish.featuredGradient === "beige" ? FEATURED_BEIGE : FEATURED_BLUE;
  const isDark = dish.featuredGradient !== "beige";
  const price = dish.price && dish.price.length > 0 ? dish.price : "—";

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
            DESTAQUE
          </span>
        }
      />
      <div
        style={{
          borderTop: "0.5px solid var(--ink)",
          padding: "16px 18px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {dish.name}
          </h3>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {price}
          </span>
        </div>
        {dish.description && (
          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 11,
              fontWeight: 400,
              lineHeight: 1.45,
              color: "var(--ink-soft)",
            }}
          >
            {dish.description}
          </p>
        )}
      </div>
    </article>
  );
}
