"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Category, Dish } from "@/lib/menu-types";
import { fs } from "@/lib/scale";

type Result = {
  dish: Dish;
  categoryId: string;
  categoryName: string;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Botão da lupa no header + overlay tela cheia com input e resultados.
 * Acessível de qualquer página onde o Header é renderizado.
 */
type SearchBarProps = {
  categories: Category[];
};

export function SearchBar({ categories }: SearchBarProps) {
  const [open, setOpen] = useState(false);

  const index = useMemo<Result[]>(() => {
    const out: Result[] = [];
    for (const c of categories) {
      for (const d of c.dishes) {
        out.push({ dish: d, categoryId: c.id, categoryName: c.name });
      }
    }
    return out;
  }, [categories]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca de pratos"
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: "var(--ink)",
          color: "#FAFAF8",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "0.5px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 1px 2px rgba(26, 14, 110, 0.15)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="6" stroke="#FAFAF8" strokeWidth="1.5" />
          <path
            d="M13.5 13.5L17 17"
            stroke="#FAFAF8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && <SearchOverlay index={index} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function SearchOverlay({ index, onClose }: { index: Result[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    if (!q) return [];
    return index
      .filter((r) => {
        const hay =
          normalize(r.dish.name) +
          " " +
          normalize(r.dish.description ?? "") +
          " " +
          normalize(r.categoryName);
        return hay.includes(q);
      })
      .slice(0, 20);
  }, [deferredQuery, index]);

  // Foca o input ao abrir
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Escape fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trava scroll do body enquanto overlay está aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const go = (r: Result) => {
    onClose();
    setQuery("");
    router.push(`/${r.categoryId}#${r.dish.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar no cardápio"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--bg-warm)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Barra superior com input */}
      <div
        style={{
          padding: "18px 22px",
          paddingTop: "max(18px, env(safe-area-inset-top))",
          borderBottom: "0.5px solid var(--ink-ghost)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <circle cx="9" cy="9" r="6" stroke="var(--ink)" strokeWidth="1.4" />
          <path
            d="M13.5 13.5L17 17"
            stroke="var(--ink)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pratos, ingredientes…"
          style={{
            flex: 1,
            minWidth: 0,
            height: 36,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: fs(15),
            color: "var(--ink)",
            fontFamily: "inherit",
            letterSpacing: "-0.005em",
            fontWeight: 400,
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar busca"
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--ink-soft)",
            borderRadius: 999,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 2L12 12M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Resultados */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px 10px 24px",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        {query.trim().length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: "48px 22px",
              color: "var(--ink-soft)",
              fontSize: fs(13),
            }}
          >
            Digite o nome de um prato, categoria ou ingrediente.
          </p>
        ) : results.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: "48px 22px",
              color: "var(--ink-soft)",
              fontSize: fs(13),
            }}
          >
            Nenhum prato encontrado para “{query.trim()}”.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {results.map((r) => (
              <li key={`${r.categoryId}-${r.dish.id}`}>
                <button
                  type="button"
                  onClick={() => go(r)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 14px",
                    cursor: "pointer",
                    color: "var(--ink)",
                    borderBottom: "0.5px solid var(--ink-trace)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontSize: fs(14),
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {r.dish.name}
                    </span>
                    {r.dish.price && (
                      <span
                        style={{
                          fontSize: fs(13),
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {r.dish.price}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: fs(10),
                      color: "var(--ink-soft)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {r.categoryName}
                  </div>
                  {r.dish.description && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: fs(11),
                        color: "var(--ink-soft)",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {r.dish.description}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
