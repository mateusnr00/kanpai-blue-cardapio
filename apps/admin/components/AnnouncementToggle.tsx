"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleAnnouncement } from "@/app/(protected)/aviso/actions";

export function AnnouncementToggle({ id, active }: { id: string; active: boolean }) {
  const [optimistic, setOptimistic] = useState(active);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOptimistic(active);
  }, [active]);

  function onToggle() {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      const res = await toggleAnnouncement(id, next);
      if ("error" in res) {
        setOptimistic(!next);
        toast.error(`Falha ao atualizar: ${res.error}`);
      } else {
        toast.success(next ? "Aviso ativado" : "Aviso desativado");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={optimistic ? "admin-toggle-on" : "admin-toggle-off"}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Desativar aviso" : "Ativar aviso"}
    >
      <span className={"admin-toggle-thumb " + (optimistic ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}
