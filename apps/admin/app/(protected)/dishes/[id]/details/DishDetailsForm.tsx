"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SectionsEditor } from "@/components/SectionsEditor";
import type { SectionRow } from "@/lib/data/sections";

type Props = {
  initialLongDescription: string;
  initialSections: SectionRow[];
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function DishDetailsForm({ initialLongDescription, initialSections, onSubmit }: Props) {
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
        toast.success("Detalhes salvos");
      }
    });
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="long_description" className="text-xs font-medium text-ink-soft">
          Descrição longa (texto principal do modal)
        </label>
        <textarea
          id="long_description"
          name="long_description"
          rows={5}
          defaultValue={initialLongDescription}
          placeholder="Apresentação geral do menu/prato que aparece no topo do modal."
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <SectionsEditor initial={initialSections} />

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
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
