"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";

type Props = {
  initial: string[];
};

export function SubcategoriesEditor({ initial }: Props) {
  const [items, setItems] = useState<string[]>(initial);
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      setInput("");
      return;
    }
    setItems([...items, trimmed]);
    setInput("");
  }

  function remove(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-fieldset-legend">Subcategorias (chips do filtro)</legend>

      <p className="mb-4 text-xs text-ink-muted">
        Ex: &quot;Todos&quot;, &quot;Quentes&quot;, &quot;Frias&quot;. Aparecem como filtro acima da lista de pratos no site.
      </p>

      {items.map((s) => (
        <input key={s} type="hidden" name="subcategory" value={s} />
      ))}

      <ul className="mb-4 flex flex-wrap gap-2">
        {items.map((s, idx) => (
          <li
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-ghost bg-bg-surface px-3 py-1.5 text-xs font-medium text-ink"
          >
            <span>{s}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label={`Remover ${s}`}
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
