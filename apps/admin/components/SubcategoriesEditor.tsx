"use client";

import { useState } from "react";

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
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Subcategorias (chips do filtro)
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Ex: "Todos", "Quentes", "Frias". Aparecem como filtro acima da lista de pratos no site.
      </p>

      {items.map((s) => (
        <input key={s} type="hidden" name="subcategory" value={s} />
      ))}

      <ul className="mb-3 flex flex-wrap gap-2">
        {items.map((s, idx) => (
          <li
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-faint bg-bg-card px-3 py-1 text-xs"
          >
            <span>{s}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label={`Remover ${s}`}
              className="text-ink-soft hover:text-red-700"
            >
              ×
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-xs italic text-ink-soft">Nenhuma subcategoria.</li>
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
          className="flex-1 rounded-md border border-ink-faint bg-bg-card px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
        >
          + Adicionar
        </button>
      </div>
    </fieldset>
  );
}
