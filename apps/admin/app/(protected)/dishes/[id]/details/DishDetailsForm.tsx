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
    <form action={action} className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="long_description" className="admin-label">
          Descrição longa (texto principal do modal)
        </label>
        <textarea
          id="long_description"
          name="long_description"
          rows={5}
          defaultValue={initialLongDescription}
          placeholder="Apresentação geral do menu/prato que aparece no topo do modal."
          className="admin-input"
        />
      </div>

      <SectionsEditor initial={initialSections} />

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-ink-ghost pt-6">
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
