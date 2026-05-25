"use client";

import { useState } from "react";
import type { DishVariantRow } from "@/lib/data/dishes";

type Props = {
  initial: DishVariantRow[];
};

type LocalVariant = {
  id: string;
  name: string;
  price: string;
  existing: boolean;
};

export function VariantsEditor({ initial }: Props) {
  const [variants, setVariants] = useState<LocalVariant[]>(
    initial.map((v) => ({ id: v.id, name: v.name, price: v.price, existing: true }))
  );

  function addVariant() {
    setVariants((v) => [
      ...v,
      { id: `new-${Date.now()}-${v.length}`, name: "", price: "", existing: false },
    ]);
  }

  function update(idx: number, field: "name" | "price", value: string) {
    setVariants((v) => v.map((x, i) => (i === idx ? { ...x, [field]: value } : x)));
  }

  function remove(idx: number) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-fieldset-legend">Variantes (escolha de proteína, sabor, opção)</legend>

      <p className="mb-4 text-xs text-ink-muted">
        Use quando o item tem opções de escolha com preços diferentes. Cada variante tem nome e preço próprio.
      </p>

      <input type="hidden" name="variants_count" value={variants.length} />

      {variants.length === 0 ? (
        <p className="text-xs italic text-ink-muted">Nenhuma variante.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {variants.map((v, idx) => (
            <li key={v.id} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name={`variant_${idx}_id`} value={v.existing ? v.id : ""} />
              <input
                type="text"
                name={`variant_${idx}_name`}
                value={v.name}
                onChange={(e) => update(idx, "name", e.target.value)}
                placeholder="Nome"
                className="admin-inline-input min-w-0 flex-1"
              />
              <input
                type="text"
                name={`variant_${idx}_price`}
                value={v.price}
                onChange={(e) => update(idx, "price", e.target.value)}
                placeholder="R$ 0,00"
                className="admin-inline-input w-24 sm:w-28"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="admin-btn-ghost text-xs text-danger"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={addVariant} className="admin-btn-secondary mt-4 text-xs">
        + Adicionar variante
      </button>
    </fieldset>
  );
}
