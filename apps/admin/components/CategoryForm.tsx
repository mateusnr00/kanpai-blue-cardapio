"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GradientInput } from "./GradientInput";
import { SubcategoriesEditor } from "./SubcategoriesEditor";
import type { CategoryRow } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: CategoryRow;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function CategoryForm({ mode, initial, onSubmit }: Props) {
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
        toast.success(mode === "create" ? "Categoria criada" : "Salvo");
      }
    });
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
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
          <label htmlFor="number" className="text-xs font-medium text-ink-soft">Número (ex: 01)</label>
          <input
            id="number"
            name="number"
            type="text"
            required
            defaultValue={initial?.number ?? ""}
            className="w-24 rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      {mode === "create" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="id" className="text-xs font-medium text-ink-soft">
            Slug (deixa vazio pra gerar do nome — imutável depois)
          </label>
          <input
            id="id"
            name="id"
            type="text"
            pattern="[a-z0-9-]+"
            placeholder="ex: festival"
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 font-mono text-sm"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Slug (imutável)</span>
          <code className="rounded-md border border-ink-faint bg-ink-trace px-3 py-2 font-mono text-sm">
            {initial?.id}
          </code>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium text-ink-soft">Descrição (microcopy do card)</label>
        <input
          id="description"
          name="description"
          type="text"
          required
          defaultValue={initial?.description ?? ""}
          placeholder='ex: "2 menus · principal experiência da casa"'
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="item_count" className="text-xs font-medium text-ink-soft">Item count (opcional)</label>
          <input
            id="item_count"
            name="item_count"
            type="text"
            defaultValue={initial?.item_count ?? ""}
            placeholder='ex: "2 menus"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail" className="text-xs font-medium text-ink-soft">Detalhe (opcional)</label>
          <input
            id="detail"
            name="detail"
            type="text"
            defaultValue={initial?.detail ?? ""}
            placeholder='ex: "começo da refeição"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="short_name" className="text-xs font-medium text-ink-soft">Nome curto (opcional)</label>
          <input
            id="short_name"
            name="short_name"
            type="text"
            defaultValue={initial?.short_name ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-soft">Gradient (CSS)</span>
        <GradientInput name="gradient" defaultValue={initial?.gradient ?? "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)"} />
      </div>

      <SubcategoriesEditor initial={initial?.subcategories ?? []} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
        Categoria em destaque (borda azul Kanpai + placeholder em gradiente azul)
      </label>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : mode === "create" ? "Criar categoria" : "Salvar"}
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
