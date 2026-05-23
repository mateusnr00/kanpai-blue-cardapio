"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteCategory } from "@/app/(protected)/cards/actions";

type Props = {
  id: string;
  name: string;
  dishCount: number;
};

export function CategoryDeleteButton({ id, name, dishCount }: Props) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success("Categoria excluída");
      }
    });
  }

  const cascade =
    dishCount > 0
      ? ` Junto com ela, ${dishCount} prato${dishCount === 1 ? "" : "s"} será${dishCount === 1 ? "" : "ão"} excluído${dishCount === 1 ? "" : "s"}.`
      : "";

  return (
    <ConfirmDialog
      title="Excluir categoria"
      description={`Tem certeza que quer excluir "${name}"?${cascade} Esta ação não pode ser desfeita.`}
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
