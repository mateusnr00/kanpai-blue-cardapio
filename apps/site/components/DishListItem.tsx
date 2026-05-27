"use client";

import { useCallback } from "react";
import type { Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { track } from "@/lib/analytics";
import { useImpressionOnce } from "@/lib/use-impression";
import { LikeButton } from "./LikeButton";
import { LikeCount } from "./LikeCount";

type Props = {
  dish: Dish;
  restaurantId: string;
  isLast?: boolean;
};

/**
 * Item em formato de LISTA (sem foto), pra categorias com displayMode='list'
 * tipo Bebidas Nao Alcoolicas. Mantem identidade visual: cores ink, hairline,
 * tabular-nums no preco.
 */
export function DishListItem({ dish, restaurantId, isLast }: Props) {
  const hasVariants = !!(dish.variants && dish.variants.length > 0);
  const hasPrice = !hasVariants && dish.price && dish.price.length > 0;
  const onImpression = useCallback(() => {
    track({ event_type: "dish_impression", dish_slug: dish.id, restaurant_id: restaurantId });
  }, [dish.id, restaurantId]);
  const ref = useImpressionOnce<HTMLElement>(onImpression);

  return (
    <article
      ref={ref}
      id={dish.id}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "14px 0",
        borderBottom: isLast ? "none" : "0.5px solid var(--ink-ghost)",
        scrollMarginTop: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            flex: 1,
            minWidth: 0,
            fontSize: fs(14),
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            lineHeight: 1.3,
          }}
        >
          {dish.name}
          {dish.unit ? (
            <span
              style={{
                marginLeft: 8,
                fontSize: fs(10),
                fontWeight: 400,
                color: "var(--ink-soft)",
                letterSpacing: 0,
              }}
            >
              {dish.unit}
            </span>
          ) : null}
        </h3>
        {hasPrice ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {dish.originalPrice ? (
              <span
                style={{
                  fontSize: fs(10),
                  fontWeight: 400,
                  textDecoration: "line-through",
                  color: "var(--ink-soft)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dish.originalPrice}
              </span>
            ) : null}
            <span
              style={{
                fontSize: fs(13),
                fontWeight: 500,
                color: "var(--ink)",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {dish.price}
            </span>
          </div>
        ) : null}
      </div>

      {dish.description ? (
        <p
          style={{
            margin: 0,
            fontSize: fs(11),
            color: "var(--ink-soft)",
            lineHeight: 1.45,
            paddingRight: 60,
          }}
        >
          {dish.description}
        </p>
      ) : null}

      {hasVariants ? (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginTop: 4,
          }}
        >
          {dish.variants!.map((v, i) => (
            <li
              key={`${v.name}-${i}`}
              style={{
                fontSize: fs(12),
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.005em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {v.price}
              {v.name ? (
                <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}> - {v.name}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {dish.tags && dish.tags.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 4,
          }}
        >
          {dish.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: fs(8),
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "2px 6px",
                border: "0.5px solid var(--ink-faint)",
                borderRadius: 999,
                color: "var(--ink-soft)",
                lineHeight: 1,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 6,
        }}
      >
        <LikeCount dishId={dish.id} fontSize={11} />
        <LikeButton dishId={dish.id} size={24} />
      </div>
    </article>
  );
}
