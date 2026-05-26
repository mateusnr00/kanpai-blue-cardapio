"use client";

import { useState, useTransition } from "react";
import { Star, CaretDown, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { ReviewRow } from "@/lib/data/reviews";
import { markReviewRead, deleteReview } from "./actions";

type Props = {
  reviews: ReviewRow[];
};

function StarRow({ value, label }: { value: number | null; label: string }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-ink-muted">{label}</span>
      <span className="flex" aria-label={`${value} de 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={12}
            weight={n <= value ? "fill" : "regular"}
            className={n <= value ? "text-amber-500" : "text-ink-faint"}
          />
        ))}
      </span>
      <span className="tabular-nums text-ink-muted">{value}/5</span>
    </div>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReviewsList({ reviews }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string, isUnread: boolean) {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next === id && isUnread) {
      startTransition(async () => {
        await markReviewRead(id);
      });
    }
  }

  function onDelete(id: string) {
    if (!confirm("Excluir esta avaliação? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await deleteReview(id);
      if ("error" in res) toast.error(res.error);
      else toast.success("Avaliação excluída.");
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-ghost bg-bg-muted/40 p-8 text-center text-sm text-ink-muted">
        Nenhuma avaliação ainda para este restaurante.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {reviews.map((r) => {
        const isUnread = r.read_at == null;
        const isOpen = expanded === r.id;
        const hasContact = !!(r.contact_name || r.contact_email || r.contact_phone);
        return (
          <li
            key={r.id}
            className={
              "rounded-xl border bg-bg-card transition " +
              (isUnread ? "border-accent/40 ring-1 ring-accent/10" : "border-ink-ghost")
            }
          >
            <button
              type="button"
              onClick={() => toggle(r.id, isUnread)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex shrink-0 items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    weight={n <= r.overall ? "fill" : "regular"}
                    className={n <= r.overall ? "text-amber-500" : "text-ink-faint"}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {r.contact_name || r.comment?.slice(0, 60) || "Avaliação anônima"}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {fmtDate(r.created_at)}
                  {r.waiter_name ? ` · garçom: ${r.waiter_name}` : ""}
                </p>
              </div>
              {isUnread ? (
                <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Novo
                </span>
              ) : null}
              <CaretDown
                size={14}
                weight="bold"
                className={"shrink-0 text-ink-muted transition-transform " + (isOpen ? "rotate-180" : "")}
              />
            </button>

            {isOpen ? (
              <div className="flex flex-col gap-4 border-t border-ink-ghost px-4 py-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <StarRow value={r.overall} label="Geral" />
                  <StarRow value={r.food} label="Comida" />
                  <StarRow value={r.ambience} label="Ambiente" />
                  <StarRow value={r.service} label="Atendimento" />
                </div>

                {r.comment ? (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                      Comentário
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-ink">{r.comment}</p>
                  </div>
                ) : null}

                {hasContact ? (
                  <div className="rounded-lg bg-bg-muted/60 px-3 py-2.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                      Contato
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink">
                      {r.contact_name ? <span>{r.contact_name}</span> : null}
                      {r.contact_email ? (
                        <a href={`mailto:${r.contact_email}`} className="text-accent hover:underline">
                          {r.contact_email}
                        </a>
                      ) : null}
                      {r.contact_phone ? (
                        <a
                          href={`https://wa.me/55${r.contact_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                        >
                          {r.contact_phone}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between border-t border-ink-ghost pt-3">
                  <p className="text-[11px] text-ink-soft">
                    {r.read_at ? `Lida em ${fmtDate(r.read_at)}` : "Marcada como lida ao abrir"}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-ghost px-2.5 py-1 text-xs text-rose-600 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash size={12} />
                    Excluir
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

