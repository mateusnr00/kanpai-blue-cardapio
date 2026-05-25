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
  const [pending, startTransition] = useTransition();

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
    <label
      className="switch"
      aria-label={optimistic ? "Desativar categoria" : "Ativar categoria"}
    >
      <input
        type="checkbox"
        checked={optimistic}
        onChange={onToggle}
        disabled={pending}
      />
      <span className="slider" />
    </label>
  );
}
