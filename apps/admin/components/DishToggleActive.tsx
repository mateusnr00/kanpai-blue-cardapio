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
  const [pending, startTransition] = useTransition();

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
    <input
      type="checkbox"
      className="switch"
      checked={optimistic}
      onChange={onToggle}
      disabled={pending}
      aria-label={optimistic ? "Desativar prato" : "Ativar prato"}
    />
  );
}
