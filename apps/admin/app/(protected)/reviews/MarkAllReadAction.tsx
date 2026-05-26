"use client";

import { useTransition } from "react";
import { Check } from "@phosphor-icons/react";
import { toast } from "sonner";
import { markAllReviewsRead } from "./actions";

export function MarkAllReadAction({ restaurantId }: { restaurantId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await markAllReviewsRead(restaurantId);
          if ("error" in res) toast.error(res.error);
          else toast.success("Todas marcadas como lidas.");
        })
      }
      disabled={pending}
      className="inline-flex items-center gap-1.5 self-start rounded-md border border-ink-ghost bg-bg-card px-3 py-1.5 text-xs font-medium text-ink hover:border-ink disabled:opacity-50"
    >
      <Check size={12} weight="bold" />
      {pending ? "Marcando..." : "Marcar todas como lidas"}
    </button>
  );
}
