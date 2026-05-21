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
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {dish.name}
          </h3>
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
        {dish.description && (
          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              fontSize: 10,
              fontWeight: 400,
              lineHeight: 1.4,
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
