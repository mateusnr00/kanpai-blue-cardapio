"use client";

import { Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteDish } from "@/app/(protected)/dishes/actions";

type Props = {
  id: string;
  name: string;
};

export function DishDeleteButton({ id, name }: Props) {
  async function onConfirm() {
    const res = await deleteDish(id);
    if ("error" in res) {
      toast.error(`Falha: ${res.error}`);
      throw new Error(res.error);
    }
    toast.success("Prato excluído");
  }

  return (
    <ConfirmDialog
      title="Excluir prato"
      description={`Tem certeza que quer excluir "${name}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      onConfirm={onConfirm}
      trigger={
        <button type="button" className="admin-btn-danger">
          <Trash size={16} />
          Excluir
        </button>
      }
    />
  );
}
