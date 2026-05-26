"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { track } from "@/lib/analytics";
import { useImpressionOnce } from "@/lib/use-impression";
import { DishImage } from "./DishImage";
import { ImageLightbox } from "./ImageLightbox";
import { LikeButton } from "./LikeButton";

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
  restaurantId: string;
};

export function DishCardSmall({ dish, number, gradientIndex, restaurantId }: Props) {
  const gradient = SMALL_GRADIENTS[gradientIndex % SMALL_GRADIENTS.length];
  const hasPrice = dish.price && dish.price.length > 0;
  const onImpression = useCallback(() => {
    track({ event_type: "dish_impression", dish_slug: dish.id, restaurant_id: restaurantId });
  }, [dish.id, restaurantId]);
  const ref = useImpressionOnce<HTMLElement>(onImpression);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const canZoom = !!dish.image;

  return (
    <>
    <article
      ref={ref}
      id={dish.id}
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--ink-faint)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignSelf: "flex-start",
        scrollMarginTop: 80,
      }}
    >
      <div
        onClick={canZoom ? () => setLightboxOpen(true) : undefined}
        role={canZoom ? "button" : undefined}
        tabIndex={canZoom ? 0 : undefined}
        onKeyDown={
          canZoom
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLightboxOpen(true);
                }
              }
            : undefined
        }
        aria-label={canZoom ? `Ampliar foto de ${dish.name}` : undefined}
        style={{ cursor: canZoom ? "zoom-in" : "default" }}
      >
        <DishImage src={dish.image} alt={dish.name} gradient={gradient} number={number} aspect="1/1" />
      </div>
      <div
        style={{
          borderTop: "0.5px solid var(--ink-faint)",
          padding: "12px 14px 14px",
        }}
      >
        <div className="dish-head">
          <h3
            className="dish-head__name"
            style={{
              fontSize: fs(13),
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {dish.name}
          </h3>
          {hasPrice && (
            <div className="dish-head__price">
              {dish.originalPrice && (
                <span
                  style={{
                    fontSize: fs(9),
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
                  fontSize: fs(12),
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
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
              marginTop: 4,
              marginBottom: 0,
              fontSize: fs(10),
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
              fontSize: fs(10),
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
                  fontSize: fs(8),
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "3px 6px",
                  border: "0.5px solid var(--ink-faint)",
                  borderRadius: 999,
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
            marginTop: 12,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <LikeButton dishId={dish.id} size="small" />
        </div>
      </div>
    </article>
    <AnimatePresence>
      {lightboxOpen && dish.image ? (
        <ImageLightbox src={dish.image} alt={dish.name} onClose={() => setLightboxOpen(false)} />
      ) : null}
    </AnimatePresence>
    </>
  );
}
