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
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Variantes (escolha de proteína, sabor, opção)
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Use quando o item tem opções de escolha com preços diferentes. Cada variante tem nome e preço próprio.
      </p>

      <input type="hidden" name="variants_count" value={variants.length} />

      {variants.length === 0 ? (
        <p className="text-xs italic text-ink-soft">Nenhuma variante.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {variants.map((v, idx) => (
            <li key={v.id} className="flex items-center gap-2">
              <input type="hidden" name={`variant_${idx}_id`} value={v.existing ? v.id : ""} />
              <input
                type="text"
                name={`variant_${idx}_name`}
                value={v.name}
                onChange={(e) => update(idx, "name", e.target.value)}
                placeholder="Nome"
                className="flex-1 rounded-md border border-ink-faint bg-bg-card px-2 py-1 text-sm"
              />
              <input
                type="text"
                name={`variant_${idx}_price`}
                value={v.price}
                onChange={(e) => update(idx, "price", e.target.value)}
                placeholder="R$ 0,00"
                className="w-28 rounded-md border border-ink-faint bg-bg-card px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs font-medium text-red-700 hover:opacity-80"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addVariant}
        className="mt-3 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
      >
        + Adicionar variante
      </button>
    </fieldset>
  );
}
