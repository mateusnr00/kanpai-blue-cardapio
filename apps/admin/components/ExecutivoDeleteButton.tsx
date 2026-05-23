"use client";

import { useTransition } from "react";
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
      description={`Tem certeza que quer excluir "${name}"? Os itens (entradas/principais/sobremesas) também serão removidos.`}
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
