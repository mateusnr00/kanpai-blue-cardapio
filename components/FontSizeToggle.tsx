"use client";

import { useFontSize } from "./FontSizeProvider";

const LABELS: Record<string, string> = {
  default: "Padrão (13px)",
  large: "Grande (15px)",
  small: "Pequeno (11px)",
};

export function FontSizeToggle() {
  const { size, next } = useFontSize();

  return (
    <button
      type="button"
      onClick={next}
      aria-label={`Tamanho da letra: ${LABELS[size]}. Toque para alternar.`}
      title={LABELS[size]}
      style={{
        height: 22,
        minWidth: 30,
        padding: "0 8px",
        border: "0.5px solid var(--ink-faint)",
        borderRadius: 999,
        background: size === "default" ? "transparent" : "var(--ink)",
        color: size === "default" ? "var(--ink)" : "var(--bg-warm)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        lineHeight: 1,
        transition: "background 180ms ease, color 180ms ease, border-color 180ms ease",
      }}
    >
      <span
        style={{
          fontSize: size === "small" ? 9 : size === "large" ? 13 : 11,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          transition: "font-size 180ms ease",
        }}
      >
        A
      </span>
      <span
        style={{
          fontSize: size === "small" ? 7 : size === "large" ? 11 : 9,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          opacity: 0.85,
          transition: "font-size 180ms ease",
        }}
      >
        a
      </span>
    </button>
  );
}
