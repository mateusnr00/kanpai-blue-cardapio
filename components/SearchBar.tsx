"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { categories, type Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";

type Result = {
  dish: Dish;
  categoryId: string;
  categoryName: string;
};

function buildIndex(): Result[] {
  const out: Result[] = [];
  for (const c of categories) {
    for (const d of c.dishes) {
      out.push({ dish: d, categoryId: c.id, categoryName: c.name });
    }
  }
  return out;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
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
      .slice(0, 8);
  }, [query, index]);

  // Foca o input ao abrir
  useEffect(() => {
    if (open) {
      // Pequeno delay pra animação de expansão terminar antes do foco
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Fecha com Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (r: Result) => {
    setOpen(false);
    setQuery("");
    router.push(`/${r.categoryId}#${r.dish.id}`);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: open ? "min(320px, 100%)" : 50,
        }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        style={{
          height: 50,
          background: "var(--ink)",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
          overflow: "hidden",
          boxShadow:
            "0 1px 2px rgba(26, 14, 110, 0.18), 0 6px 14px rgba(26, 14, 110, 0.18)",
        }}
      >
        {/* Botão da lupa */}
        <button
          type="button"
          onClick={() => {
            if (open) {
              setOpen(false);
              setQuery("");
            } else {
              setOpen(true);
            }
          }}
          aria-label={open ? "Fechar busca" : "Abrir busca"}
          style={{
            flexShrink: 0,
            width: 50,
            height: 50,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FAFAF8",
            cursor: "pointer",
          }}
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="#FAFAF8"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="9" cy="9" r="6" stroke="#FAFAF8" strokeWidth="1.4" />
              <path
                d="M13.5 13.5L17 17"
                stroke="#FAFAF8"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        {/* Input */}
        {open && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pratos…"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              paddingLeft: 18,
              paddingRight: 6,
              fontSize: fs(14),
              fontWeight: 400,
              color: "#FAFAF8",
              fontFamily: "inherit",
              letterSpacing: "-0.005em",
            }}
          />
        )}
      </motion.div>

      {/* Dropdown de resultados */}
      <AnimatePresence>
        {open && query.trim().length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "absolute",
              top: 56,
              right: 0,
              width: "min(360px, 100%)",
              maxHeight: 380,
              overflowY: "auto",
              background: "var(--bg-card)",
              border: "0.5px solid var(--ink-faint)",
              borderRadius: 12,
              boxShadow:
                "0 4px 12px rgba(26, 14, 110, 0.12), 0 12px 32px rgba(26, 14, 110, 0.15)",
              zIndex: 50,
            }}
          >
            {results.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  padding: "20px 18px",
                  fontSize: fs(12),
                  color: "var(--ink-soft)",
                  textAlign: "center",
                }}
              >
                Nenhum prato encontrado.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 6 }}>
                {results.map((r) => (
                  <li key={`${r.categoryId}-${r.dish.id}`}>
                    <button
                      type="button"
                      onClick={() => go(r)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "var(--ink)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--ink-trace)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: fs(13),
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {r.dish.name}
                        </span>
                        {r.dish.price && (
                          <span
                            style={{
                              fontSize: fs(12),
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
                          marginTop: 2,
                          fontSize: fs(10),
                          color: "var(--ink-soft)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        {r.categoryName}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
