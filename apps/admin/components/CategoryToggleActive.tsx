"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleCategoryActive } from "@/app/(protected)/cards/actions";

type Props = {
  id: string;
  active: boolean;
};

export function CategoryToggleActive({ id, active }: Props) {
  const [optimistic, setOptimistic] = useState(active);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  function onToggle() {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      const res = await toggleCategoryActive(id, next);
      if ("error" in res) {
        setOptimistic(!next);
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success(next ? "Categoria ativada" : "Categoria desativada");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        "inline-flex h-5 w-9 items-center rounded-full transition " +
        (optimistic ? "bg-ink" : "bg-ink-faint")
      }
      aria-pressed={optimistic}
      aria-label={optimistic ? "Desativar categoria" : "Ativar categoria"}
    >
      <span
        className={
          "inline-block h-4 w-4 rounded-full bg-white transition " +
          (optimistic ? "translate-x-4" : "translate-x-0.5")
        }
      />
    </button>
  );
}
