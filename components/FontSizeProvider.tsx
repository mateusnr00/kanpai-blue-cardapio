"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type FontSize = "default" | "large" | "small";

// Ciclo: default (13px) → large (15px) → small (11px) → reset (default)
const CYCLE: Record<FontSize, FontSize> = {
  default: "large",
  large: "small",
  small: "default",
};

type FontSizeContextValue = {
  size: FontSize;
  next: () => void;
  reset: () => void;
};

const FontSizeContext = createContext<FontSizeContextValue | undefined>(undefined);

const STORAGE_KEY = "kanpai-text-size";

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<FontSize>("default");

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as FontSize | null)
        : null;
    const initial =
      stored === "default" || stored === "large" || stored === "small" ? stored : "default";
    setSize(initial);
    document.documentElement.setAttribute("data-text-size", initial);
  }, []);

  const apply = (s: FontSize) => {
    setSize(s);
    document.documentElement.setAttribute("data-text-size", s);
    try {
      localStorage.setItem(STORAGE_KEY, s);
    } catch {}
  };

  const next = () => apply(CYCLE[size]);
  const reset = () => apply("default");

  return (
    <FontSizeContext.Provider value={{ size, next, reset }}>{children}</FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used inside FontSizeProvider");
  return ctx;
}
