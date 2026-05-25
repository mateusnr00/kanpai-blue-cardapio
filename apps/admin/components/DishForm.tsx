"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { BadgeCheckboxes } from "./BadgeCheckboxes";
import { VariantsEditor } from "./VariantsEditor";
import type { DishDetail, DishVariantRow } from "@/lib/data/dishes";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: DishDetail;
  variants?: DishVariantRow[];
  categories: CategoryListItem[];
  defaultCategoryId?: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function DishForm({ mode, initial, variants = [], categories, defaultCategoryId, onSubmit }: Props) {
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
        toast.success(mode === "create" ? "Prato criado" : "Salvo");
      }
    });
  }

  const currentCategoryId = initial?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "";

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-ink-soft">Nome</label>
          <input
            id="name"
            name="name"
            type="text"
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
            defaultValue={currentCategoryId}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium text-ink-soft">Descrição</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-xs font-medium text-ink-soft">Preço (texto, ex: R$ 82,90)</label>
          <input
            id="price"
            name="price"
            type="text"
            defaultValue={initial?.price ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="original_price" className="text-xs font-medium text-ink-soft">Preço antes (promo, opcional)</label>
          <input
            id="original_price"
            name="original_price"
            type="text"
            defaultValue={initial?.original_price ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className="text-xs font-medium text-ink-soft">Subcategoria (opcional)</label>
          <input
            id="subcategory"
            name="subcategory"
            type="text"
            defaultValue={initial?.subcategory ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-soft">Foto</span>
        <ImageUpload name="image" initialPath={initial?.image_path ?? null} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-soft">Badges</span>
        <BadgeCheckboxes initial={initial?.badges ?? []} />
      </div>

      {mode === "edit" && initial ? (
        <div className="flex flex-col gap-3 rounded-md border border-ink-faint bg-bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Detalhes (texto longo + seções)</p>
            <p className="text-xs text-ink-soft">
              Modal "Ver itens" no cardápio. Use pra Festival Premium e menus com mais texto.
            </p>
          </div>
          <a
            href={`/dishes/${initial.id}/details`}
            className="self-start rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink sm:self-auto"
          >
            Editar detalhes →
          </a>
        </div>
      ) : null}

      <VariantsEditor initial={variants} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
        Prato em destaque (linha cheia + badge DESTAQUE)
      </label>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : mode === "create" ? "Criar item" : "Salvar"}
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
