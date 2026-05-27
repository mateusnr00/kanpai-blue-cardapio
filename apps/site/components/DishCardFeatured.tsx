"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { track } from "@/lib/analytics";
import { useImpressionOnce } from "@/lib/use-impression";
import { preloadLightboxImage } from "@/lib/preload-lightbox";
import { DishImage } from "./DishImage";
import { LikeButton } from "./LikeButton";
import { LikeCount } from "./LikeCount";

const ImageLightbox = dynamic(
  () => import("./ImageLightbox").then((m) => m.ImageLightbox),
  { ssr: false },
);

const DishDetailsModal = dynamic(
  () => import("./DishDetailsModal").then((m) => m.DishDetailsModal),
  { ssr: false },
);

const FEATURED_BLUE = "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)";
const FEATURED_BEIGE = "linear-gradient(135deg, #C8BFA0 0%, #A89878 100%)";

type Props = {
  dish: Dish;
  number: string;
  /** Forced gradient choice (alternated by parent for rhythm). */
  variant?: "blue" | "beige";
  restaurantId: string;
  priority?: boolean;
};

export function DishCardFeatured({ dish, number, variant = "blue", restaurantId, priority }: Props) {
  const gradient = variant === "beige" ? FEATURED_BEIGE : FEATURED_BLUE;
  const isDark = variant !== "beige";
  const hasPrice = dish.price && dish.price.length > 0;
  const hasDetails =
    (!!dish.details && dish.details.sections.length > 0) ||
    (!!dish.components && dish.components.length > 0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Quando o card tem detalhes (executivo com componentes / sections), o
  // clique abre o modal — nao o lightbox da capa. Lightbox so faz sentido
  // em pratos sem detalhes, onde a foto e o conteudo principal.
  const canZoom = !!dish.image && !hasDetails;

  const onImpression = useCallback(() => {
    track({ event_type: "dish_impression", dish_slug: dish.id, restaurant_id: restaurantId });
    // pre-carrega a versao do lightbox em background — abertura instantanea quando clicar
    if (canZoom && dish.image) preloadLightboxImage(dish.image);
  }, [canZoom, dish.id, dish.image, restaurantId]);
  const ref = useImpressionOnce<HTMLElement>(onImpression);

  const openDetails = useCallback(() => {
    setDetailsOpen(true);
    track({ event_type: "dish_view", dish_slug: dish.id, restaurant_id: restaurantId });
  }, [dish.id, restaurantId]);

  return (
    <>
    <article
      ref={ref}
      id={dish.id}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--ink)",
        borderRadius: 24,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        scrollMarginTop: 80,
        cursor: hasDetails ? "pointer" : "default",
        boxShadow: "0 2px 4px rgba(26, 14, 110, 0.06), 0 16px 36px rgba(26, 14, 110, 0.10)",
        transition: "transform 220ms ease, box-shadow 220ms ease",
      }}
      onClick={hasDetails ? openDetails : undefined}
      role={hasDetails ? "button" : undefined}
      tabIndex={hasDetails ? 0 : undefined}
      onKeyDown={
        hasDetails
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetails();
              }
            }
          : undefined
      }
    >
      <div
        onClick={
          canZoom
            ? (e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }
            : undefined
        }
        role={canZoom ? "button" : undefined}
        tabIndex={canZoom ? 0 : undefined}
        onKeyDown={
          canZoom
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setLightboxOpen(true);
                }
              }
            : undefined
        }
        aria-label={canZoom ? `Ampliar foto de ${dish.name}` : undefined}
        style={{ cursor: canZoom ? "zoom-in" : "default" }}
      >
        <DishImage
          src={dish.image}
          alt={dish.name}
          gradient={gradient}
          number={number}
          aspect="16/9"
          dark={isDark}
          priority={priority}
          blurDataUrl={dish.blurDataUrl}
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
                borderRadius: 999,
              }}
            >
              DESTAQUE
            </span>
          }
        />
      </div>
      <div
        style={{
          borderTop: "0.5px solid var(--ink)",
          padding: "16px 18px 18px",
        }}
      >
        <div className="dish-head" style={{ gap: 12 }}>
          <h3
            className="dish-head__name"
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
            <div className="dish-head__price" style={{ gap: 2 }}>
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
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: hasDetails ? "space-between" : "flex-end",
            gap: 10,
          }}
        >
          {hasDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetails();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                background: "transparent",
                border: "0.5px solid var(--ink)",
                borderRadius: 999,
                cursor: "pointer",
                color: "var(--ink)",
                fontSize: fs(12),
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              Ver itens
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 1L7 5L3 9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <LikeCount dishId={dish.id} fontSize={13} />
            <LikeButton dishId={dish.id} size={32} />
          </div>
        </div>
      </div>
    </article>
    <AnimatePresence>
      {detailsOpen && (
        <DishDetailsModal dish={dish} onClose={() => setDetailsOpen(false)} />
      )}
    </AnimatePresence>
    <AnimatePresence>
      {lightboxOpen && dish.image ? (
        <ImageLightbox
          src={dish.image}
          alt={dish.name}
          description={dish.description}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </AnimatePresence>
    </>
  );
}
