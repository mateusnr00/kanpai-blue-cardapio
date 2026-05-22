"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { LikeButton } from "./LikeButton";

type Props = {
  dish: Dish;
  onClose: () => void;
};

export function DishDetailsModal({ dish, onClose }: Props) {
  // Trava scroll do body enquanto modal está aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!dish.details) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes ${dish.name}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(26, 14, 110, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "92dvh",
          background: "var(--bg-card)",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -12px 36px rgba(26, 14, 110, 0.18)",
        }}
      >
        {/* Drag handle visual no topo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 10,
            paddingBottom: 4,
          }}
          aria-hidden
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: "var(--ink-faint)",
            }}
          />
        </div>

        {/* Cabeçalho */}
        <div
          style={{
            padding: "16px 22px 18px",
            borderBottom: "0.5px solid var(--ink-ghost)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: fs(22),
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "var(--ink)",
              }}
            >
              {dish.name}
            </h2>
            {dish.price && (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: fs(15),
                  fontWeight: 500,
                  color: "var(--ink)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dish.price}
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
                      fontSize: fs(9),
                      fontWeight: 500,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "4px 8px",
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-soft)",
              cursor: "pointer",
              border: "0.5px solid var(--ink-faint)",
              background: "transparent",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 2L12 12M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 22px 24px",
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
          }}
        >
          {dish.details.longDescription && (
            <p
              style={{
                margin: 0,
                fontSize: fs(12),
                color: "var(--ink-soft)",
                lineHeight: 1.55,
              }}
            >
              {dish.details.longDescription}
            </p>
          )}

          {dish.details.sections.map((section, idx) => (
            <section
              key={section.label}
              style={{
                marginTop:
                  idx === 0 && !dish.details!.longDescription ? 0 : 22,
                paddingTop: idx === 0 && !dish.details!.longDescription ? 0 : 22,
                borderTop:
                  idx === 0 && !dish.details!.longDescription
                    ? "none"
                    : "0.5px solid var(--ink-trace)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: fs(10),
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--ink-soft)",
                }}
              >
                {section.label}
              </h3>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: fs(13),
                  lineHeight: 1.55,
                  color: "var(--ink)",
                }}
              >
                {section.description}
              </p>
            </section>
          ))}
        </div>

        {/* Rodapé com like */}
        <div
          style={{
            padding: "14px 22px",
            paddingBottom: "max(14px, env(safe-area-inset-bottom))",
            borderTop: "0.5px solid var(--ink-ghost)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <LikeButton dishId={dish.id} size="large" />
        </div>
      </motion.div>
    </motion.div>
  );
}
