"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  showBack?: boolean;
};

export function Header({ showBack = false }: Props) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between"
      style={{
        background: "var(--bg)",
        padding: "18px 22px",
        borderBottom: "0.5px solid var(--ink-ghost)",
        transition: "background 200ms ease",
      }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href="/"
            aria-label="Voltar para o cardápio"
            className="flex items-center justify-center"
            style={{ width: 14, height: 14 }}
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden>
              <path
                d="M6.5 1L1.5 6L6.5 11"
                stroke="var(--ink)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
        <Link
          href="/"
          aria-label="Ir para o cardápio"
          style={{
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          kanpai
        </Link>
      </div>
      <ThemeToggle />
    </header>
  );
}
