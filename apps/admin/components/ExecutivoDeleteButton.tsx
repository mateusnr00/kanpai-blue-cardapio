"use client";

import { useTransition } from "react";
import { Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteExecutivo } from "@/app/(protected)/executivos/actions";

type Props = {
  id: string;
  name: string;
};

export function ExecutivoDeleteButton({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteExecutivo(id);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success("Executivo excluído");
      }
    });
  }

  return (
    <ConfirmDialog
      title="Excluir executivo"
      description={`Tem certeza que quer excluir "${name}"? Os itens também serão removidos.`}
      confirmLabel="Excluir"
      pending={pending}
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
