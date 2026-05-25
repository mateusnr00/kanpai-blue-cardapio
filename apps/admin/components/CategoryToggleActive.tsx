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
      className={optimistic ? "admin-toggle-on" : "admin-toggle-off"}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Desativar categoria" : "Ativar categoria"}
    >
      <span className={"admin-toggle-thumb " + (optimistic ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}
