"use client";

import { useState } from "react";
import { fs } from "@/lib/scale";

type Props = {
  options: string[];
  /** Chamado quando o usuario clica num chip. Recebe o valor selecionado. */
  onSelect?: (value: string) => void;
  /** Subcategoria atualmente ativa (controlado externamente, opcional). */
  active?: string;
};

export function SubcategoryChips({ options, onSelect, active: activeProp }: Props) {
  const [activeState, setActiveState] = useState(options[0] ?? "Todos");
  const active = activeProp ?? activeState;

  const handle = (option: string) => {
    setActiveState(option);
    onSelect?.(option);
  };

  return (
    <div
      className="no-scrollbar"
      role="tablist"
      aria-label="Subcategorias"
      style={{
        position: "sticky",
        top: 58,
        zIndex: 20,
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "10px 22px",
        background: "var(--bg)",
        borderBottom: "0.5px solid var(--ink-ghost)",
        scrollSnapType: "x proximity",
      }}
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handle(option)}
            style={{
              flex: "0 0 auto",
              padding: "7px 14px",
              fontSize: fs(11),
              fontWeight: 500,
              letterSpacing: "-0.005em",
              background: isActive ? "var(--ink)" : "transparent",
              color: isActive ? "var(--bg-warm)" : "var(--ink)",
              border: isActive ? "1px solid var(--ink)" : "0.5px solid var(--ink-faint)",
              borderRadius: 999,
              scrollSnapAlign: "start",
              transition: "background 180ms ease, color 180ms ease, border-color 180ms ease",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
