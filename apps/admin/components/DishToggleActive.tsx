"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleDishActive } from "@/app/(protected)/dishes/actions";

type Props = {
  id: string;
  active: boolean;
};

export function DishToggleActive({ id, active }: Props) {
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !active;
    startTransition(async () => {
      const res = await toggleDishActive(id, next);
      if ("error" in res) {
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
      disabled={pending}
      className={
        "inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-50 " +
        (active ? "bg-ink" : "bg-ink-faint")
      }
      aria-pressed={active}
      aria-label={active ? "Desativar prato" : "Ativar prato"}
    >
      <span
        className={
          "inline-block h-4 w-4 rounded-full bg-white transition " +
          (active ? "translate-x-4" : "translate-x-0.5")
        }
      />
    </button>
  );
}
