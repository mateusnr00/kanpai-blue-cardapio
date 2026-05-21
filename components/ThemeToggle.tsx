"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isCool = theme === "cool";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Trocar para tema ${isCool ? "warm" : "cool"}`}
      className="relative inline-flex items-center"
      style={{ height: 22 }}
    >
      <div
        className="relative flex items-center justify-between"
        style={{
          width: 56,
          height: 22,
          padding: "0 4px",
          border: "0.5px solid var(--ink-faint)",
          borderRadius: 999,
          background: "transparent",
        }}
      >
        {/* sliding pill */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 2,
            left: isCool ? 28 : 2,
            width: 22,
            height: 16,
            borderRadius: 999,
            background: "var(--ink)",
            transition: "left 220ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        />
        {/* warm dot */}
        <span
          aria-hidden
          style={{
            position: "relative",
            zIndex: 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: "0.5px solid var(--ink-faint)",
            background: isCool ? "transparent" : "var(--bg-warm)",
          }}
        />
        {/* cool dot */}
        <span
          aria-hidden
          style={{
            position: "relative",
            zIndex: 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: "0.5px solid var(--ink-faint)",
            background: isCool ? "var(--bg-cool)" : "transparent",
          }}
        />
      </div>
    </button>
  );
}
