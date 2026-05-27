"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";

type Mode = "grid" | "list";

type Item = { name: string; mode: Mode };

type Props = {
  initial: string[];
  /** Mapa subcategoria → modo (default 'grid' se ausente). */
  initialModes?: Record<string, Mode>;
};

export function SubcategoriesEditor({ initial, initialModes }: Props) {
  const [items, setItems] = useState<Item[]>(() =>
    initial.map((name) => ({
      name,
      mode: (initialModes?.[name] === "list" ? "list" : "grid") as Mode,
    })),
  );
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.some((it) => it.name === trimmed)) {
      setInput("");
      return;
    }
    setItems([...items, { name: trimmed, mode: "grid" }]);
    setInput("");
  }

  function remove(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function toggleMode(idx: number) {
    setItems(items.map((it, i) => (i === idx ? { ...it, mode: it.mode === "list" ? "grid" : "list" } : it)));
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-fieldset-legend">Subcategorias (chips do filtro)</legend>

      <p className="mb-4 text-xs text-ink-muted">
        Ex: &quot;Quentes&quot;, &quot;Frias&quot;. Aparecem como filtro acima da lista no site.
        Cada subcategoria pode ser exibida como <strong>Cards</strong> (foto) ou <strong>Lista</strong> (texto) — bom pra bebidas e drinks que não têm foto.
      </p>

      <input type="hidden" name="subcategory_count" value={items.length} readOnly />
      {items.map((it, i) => (
        <span key={`hidden-${i}`}>
          <input type="hidden" name={`subcategory_${i}_name`} value={it.name} readOnly />
          <input type="hidden" name={`subcategory_${i}_mode`} value={it.mode} readOnly />
          {/* Mantém o nome em "subcategory" pra qualquer caller legacy */}
          <input type="hidden" name="subcategory" value={it.name} readOnly />
        </span>
      ))}

      <ul className="mb-4 flex flex-col gap-2">
        {items.map((it, idx) => (
          <li
            key={it.name}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-ghost bg-bg-surface px-3 py-2"
          >
            <span className="flex-1 min-w-0 truncate text-sm font-medium text-ink">{it.name}</span>
            <button
              type="button"
              onClick={() => toggleMode(idx)}
              className={
                "rounded-full border px-3 py-1 text-[11px] font-medium transition " +
                (it.mode === "list"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-ink-ghost bg-bg-surface text-ink-muted hover:text-ink")
              }
              aria-label={`Trocar exibição (atual: ${it.mode === "list" ? "lista" : "cards"})`}
            >
              {it.mode === "list" ? "Lista" : "Cards"}
            </button>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label={`Remover ${it.name}`}
              className="text-ink-muted transition hover:text-danger"
            >
              <X size={14} weight="bold" />
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-xs italic text-ink-muted">Nenhuma subcategoria.</li>
        ) : null}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Digite e Enter"
          className="admin-input flex-1"
        />
        <button type="button" onClick={add} className="admin-btn-secondary shrink-0 text-xs">
          + Adicionar
        </button>
      </div>
    </fieldset>
  );
}
