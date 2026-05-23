"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExecutivoItemsList } from "./ExecutivoItemsList";
import type { ExecutivoRow, ExecutivoItemRow } from "@/lib/data/executivos";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: ExecutivoRow;
  items?: ExecutivoItemRow[];
  categories: CategoryListItem[];
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function ExecutivoForm({ mode, initial, items = [], categories, onSubmit }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success(mode === "create" ? "Executivo criado" : "Salvo");
      }
    });
  }

  const entradas = items.filter((it) => it.kind === "entrada");
  const principais = items.filter((it) => it.kind === "principal");
  const sobremesas = items.filter((it) => it.kind === "sobremesa");

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-ink-soft">Nome</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category_id" className="text-xs font-medium text-ink-soft">Categoria</label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={initial?.category_id ?? categories[0]?.id ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-xs font-medium text-ink-soft">Preço</label>
          <input
            id="price"
            name="price"
            required
            defaultValue={initial?.price ?? ""}
            placeholder='ex: "R$ 89,90"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="format" className="text-xs font-medium text-ink-soft">Formato</label>
          <input
            id="format"
            name="format"
            required
            defaultValue={initial?.format ?? ""}
            placeholder='ex: "Entrada + Principal"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className="text-xs font-medium text-ink-soft">Subcategoria (opcional)</label>
          <input
            id="subcategory"
            name="subcategory"
            defaultValue={initial?.subcategory ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium text-ink-soft">Descrição</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={initial?.description ?? ""}
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="validity" className="text-xs font-medium text-ink-soft">Validade (opcional)</label>
        <input
          id="validity"
          name="validity"
          defaultValue={initial?.validity ?? ""}
          placeholder='ex: "Segunda a sexta, 11h30 às 15h"'
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <ExecutivoItemsList kind="entrada" initial={entradas} title="Entradas" />
      <ExecutivoItemsList kind="principal" initial={principais} title="Principais" />
      <ExecutivoItemsList kind="sobremesa" initial={sobremesas} title="Sobremesas" showPrice />

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : mode === "create" ? "Criar executivo" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-ink-faint px-4 py-2 text-sm font-medium hover:border-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
