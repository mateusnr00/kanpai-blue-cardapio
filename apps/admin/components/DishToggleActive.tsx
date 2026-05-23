"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleDishActive } from "@/app/(protected)/dishes/actions";

type Props = {
  id: string;
  active: boolean;
};

export function DishToggleActive({ id, active }: Props) {
  const [optimistic, setOptimistic] = useState(active);
  const [, startTransition] = useTransition();

  // Sync com a prop quando o server revalida (categoria recarrega).
  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  function onToggle() {
    const next = !optimistic;
    setOptimistic(next); // flip imediato
    startTransition(async () => {
      const res = await toggleDishActive(id, next);
      if ("error" in res) {
        setOptimistic(!next); // reverte
        toast.error(`Falha ao atualizar: ${res.error}`);
      } else {
        toast.success(next ? "Ativado" : "Desativado");
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
      aria-label={optimistic ? "Desativar prato" : "Ativar prato"}
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
