"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleCategoryActive } from "@/app/(protected)/cards/actions";

type Props = {
  id: string;
  active: boolean;
};

export function CategoryToggleActive({ id, active }: Props) {
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !active;
    startTransition(async () => {
      const res = await toggleCategoryActive(id, next);
      if ("error" in res) {
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
      disabled={pending}
      className={
        "inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-50 " +
        (active ? "bg-ink" : "bg-ink-faint")
      }
      aria-pressed={active}
      aria-label={active ? "Desativar categoria" : "Ativar categoria"}
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
