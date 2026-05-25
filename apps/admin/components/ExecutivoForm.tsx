"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminSelect } from "./AdminSelect";
import { ExecutivoItemsList } from "./ExecutivoItemsList";
import type { ExecutivoRow, ExecutivoItemRow } from "@/lib/data/executivos";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: ExecutivoRow;
  items?: ExecutivoItemRow[];
  categories: CategoryListItem[];
  defaultCategoryId?: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function ExecutivoForm({ mode, initial, items = [], categories, defaultCategoryId, onSubmit }: Props) {
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
    <form action={action} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="admin-label">Nome</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category_id" className="admin-label">Categoria</label>
          <AdminSelect
            id="category_id"
            name="category_id"
            required
            defaultValue={initial?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? ""}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="admin-label">Preço</label>
          <input
            id="price"
            name="price"
            required
            defaultValue={initial?.price ?? ""}
            placeholder='ex: "R$ 89,90"'
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="format" className="admin-label">Formato</label>
          <input
            id="format"
            name="format"
            required
            defaultValue={initial?.format ?? ""}
            placeholder='ex: "Entrada + Principal"'
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className="admin-label">Subcategoria (opcional)</label>
          <input
            id="subcategory"
            name="subcategory"
            defaultValue={initial?.subcategory ?? ""}
            className="admin-input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="admin-label">Descrição</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={initial?.description ?? ""}
          className="admin-input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="validity" className="admin-label">Validade (opcional)</label>
        <input
          id="validity"
          name="validity"
          defaultValue={initial?.validity ?? ""}
          placeholder='ex: "Segunda a sexta, 11h30 às 15h"'
          className="admin-input"
        />
      </div>

      <ExecutivoItemsList kind="entrada" initial={entradas} title="Entradas" />
      <ExecutivoItemsList kind="principal" initial={principais} title="Principais" />
      <ExecutivoItemsList kind="sobremesa" initial={sobremesas} title="Sobremesas" showPrice />

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-ink-ghost pt-6">
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "Salvando..." : mode === "create" ? "Criar executivo" : "Salvar"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
