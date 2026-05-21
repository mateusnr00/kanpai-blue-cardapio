"use client";

import { useState } from "react";

type Props = {
  options: string[];
  onChange?: (value: string) => void;
};

export function SubcategoryChips({ options, onChange }: Props) {
  const [active, setActive] = useState(options[0] ?? "Todos");

  const handle = (option: string) => {
    setActive(option);
    onChange?.(option);
  };

  return (
    <div
      className="no-scrollbar"
      role="tablist"
      aria-label="Subcategorias"
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "8px 22px",
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
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "-0.005em",
              background: isActive ? "var(--ink)" : "transparent",
              color: isActive ? "var(--bg-warm)" : "var(--ink)",
              border: isActive ? "1px solid var(--ink)" : "0.5px solid var(--ink-faint)",
              borderRadius: 2,
              scrollSnapAlign: "start",
              transition: "background 180ms ease, color 180ms ease, border-color 180ms ease",
              whiteSpace: "nowrap",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
