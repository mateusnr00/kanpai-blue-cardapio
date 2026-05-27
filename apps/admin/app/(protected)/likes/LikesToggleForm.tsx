"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleLikesEnabled } from "./actions";

type Props = {
  initialEnabled: boolean;
};

export function LikesToggleForm({ initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    startTransition(async () => {
      const res = await toggleLikesEnabled(next);
      if (res?.error) {
        setEnabled(previous);
        toast.error(res.error);
      } else {
        toast.success(next ? "Curtidas ativadas" : "Curtidas desativadas");
      }
    });
  }

  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={enabled}
        disabled={pending}
        onChange={(e) => handleChange(e.target.checked)}
        className="mt-1"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-ink">Curtidas ativadas no site</span>
        <span className="text-xs text-ink-muted">
          Quando ligado, o coração aparece em cada prato e o cliente pode curtir. Quando desligado, o botão
          some completamente (a contagem fica preservada no banco).
        </span>
      </span>
    </label>
  );
}
