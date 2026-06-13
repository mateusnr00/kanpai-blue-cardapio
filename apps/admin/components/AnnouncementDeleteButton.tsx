"use client";

import { Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteAnnouncement } from "@/app/(protected)/aviso/actions";

export function AnnouncementDeleteButton({ id, name }: { id: string; name: string }) {
  async function onConfirm() {
    const res = await deleteAnnouncement(id);
    if ("error" in res) {
      toast.error(`Falha: ${res.error}`);
      throw new Error(res.error);
    }
    toast.success("Aviso excluído");
  }

  return (
    <ConfirmDialog
      title="Excluir aviso"
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
