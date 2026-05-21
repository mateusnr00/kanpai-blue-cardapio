"use client";

import type { Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { PlaceholderImage } from "./PlaceholderImage";
import { LikeButton } from "./LikeButton";

const FEATURED_BLUE = "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)";
const FEATURED_BEIGE = "linear-gradient(135deg, #C8BFA0 0%, #A89878 100%)";

type Props = {
  dish: Dish;
  number: string;
  /** Forced gradient choice (alternated by parent for rhythm). */
  variant?: "blue" | "beige";
};

export function DishCardFeatured({ dish, number, variant = "blue" }: Props) {
  const gradient = variant === "beige" ? FEATURED_BEIGE : FEATURED_BLUE;
  const isDark = variant !== "beige";
  const hasPrice = dish.price && dish.price.length > 0;

  return (
    <article
      id={dish.id}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--ink)",
        display: "flex",
        flexDirection: "column",
        scrollMarginTop: 80,
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
              fontSize: fs(17),
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {dish.name}
          </h3>
          {hasPrice && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              {dish.originalPrice && (
                <span
                  style={{
                    fontSize: fs(11),
                    fontWeight: 400,
                    textDecoration: "line-through",
                    color: "var(--ink-soft)",
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {dish.originalPrice}
                </span>
              )}
              <span
                style={{
                  fontSize: fs(14),
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dish.price}
              </span>
            </div>
          )}
        </div>

        {dish.unit && (
          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              fontSize: fs(11),
              fontWeight: 400,
              color: "var(--ink-soft)",
              opacity: 0.9,
            }}
          >
            {dish.unit}
          </p>
        )}

        {dish.description && (
          <p
            style={{
              marginTop: dish.unit ? 6 : 8,
              marginBottom: 0,
              fontSize: fs(11),
              fontWeight: 400,
              lineHeight: 1.45,
              color: "var(--ink-soft)",
            }}
          >
            {dish.description}
          </p>
        )}

        {dish.tags && dish.tags.length > 0 && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {dish.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: fs(8),
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  padding: "3px 7px",
                  border: "0.5px solid var(--ink-faint)",
                  color: "var(--ink-soft)",
                  lineHeight: 1,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <LikeButton dishId={dish.id} size="large" />
        </div>
      </div>
    </article>
  );
}
