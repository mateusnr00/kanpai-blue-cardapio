"use client";

import type { Dish } from "@/lib/menu-data";
import { PlaceholderImage } from "./PlaceholderImage";

const SMALL_GRADIENTS = [
  "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)",
  "linear-gradient(135deg, #E5DEC8 0%, #D2C7AA 100%)",
  "linear-gradient(135deg, #EFE9D7 0%, #DFD4B6 100%)",
  "linear-gradient(135deg, #E7E0CB 0%, #D5CAAE 100%)",
  "linear-gradient(135deg, #ECE5D1 0%, #DCD1B3 100%)",
  "linear-gradient(135deg, #E2DBC4 0%, #D0C5A6 100%)",
];

type Props = {
  dish: Dish;
  number: string;
  gradientIndex: number;
};

export function DishCardSmall({ dish, number, gradientIndex }: Props) {
  const gradient = SMALL_GRADIENTS[gradientIndex % SMALL_GRADIENTS.length];
  const price = dish.price && dish.price.length > 0 ? dish.price : "—";

  return (
    <article
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--ink-faint)",
        display: "flex",
        flexDirection: "column",
        alignSelf: "flex-start",
      }}
    >
      <PlaceholderImage gradient={gradient} number={number} aspect="1/1" />
      <div
        style={{
          borderTop: "0.5px solid var(--ink-faint)",
          padding: "12px 14px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <h3
            style={{
              fontSize: "var(--text-name)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {dish.name}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            {dish.originalPrice && (
              <span
                style={{
                  fontSize: 9,
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
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {price}
            </span>
          </div>
        </div>

        {dish.unit && (
          <p
            style={{
              marginTop: 4,
              marginBottom: 0,
              fontSize: 10,
              fontWeight: 400,
              color: "var(--ink-soft)",
              opacity: 0.85,
            }}
          >
            {dish.unit}
          </p>
        )}

        {dish.description && (
          <p
            style={{
              marginTop: dish.unit ? 4 : 6,
              marginBottom: 0,
              fontSize: "var(--text-desc)",
              fontWeight: 400,
              lineHeight: 1.4,
              color: "var(--ink-soft)",
            }}
          >
            {dish.description}
          </p>
        )}

        {dish.tags && dish.tags.length > 0 && (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {dish.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 8,
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "3px 6px",
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
      </div>
    </article>
  );
}
