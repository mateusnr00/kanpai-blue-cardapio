"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteDish } from "@/app/(protected)/dishes/actions";

type Props = {
  id: string;
  name: string;
};

export function DishDeleteButton({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteDish(id);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success("Prato excluído");
      }
    });
  }

  return (
    <ConfirmDialog
      title="Excluir prato"
      description={`Tem certeza que quer excluir "${name}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      pending={pending}
      onConfirm={onConfirm}
      trigger={
        <button
          type="button"
          className="text-xs font-medium text-red-700 transition hover:opacity-80"
        >
          Excluir
        </button>
      }
    />
  );
}
