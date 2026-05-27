"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PencilSimple,
  Plus,
  Trash,
  ArrowsClockwise,
  ToggleLeft,
} from "@phosphor-icons/react";
import type { AuditRow } from "@/lib/data/audit";

type Props = {
  rows: AuditRow[];
  filters: {
    entity: string | null;
    action: string | null;
  };
};

const ENTITY_LABEL: Record<string, string> = {
  dish: "Prato",
  category: "Categoria",
  linktree_button: "Linktree",
  review: "Avaliação",
  restaurant: "Restaurante",
  user: "Usuário",
};

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  create: { label: "Criou", color: "bg-emerald-100 text-emerald-700" },
  update: { label: "Editou", color: "bg-blue-100 text-blue-700" },
  delete: { label: "Excluiu", color: "bg-rose-100 text-rose-700" },
  reorder: { label: "Reordenou", color: "bg-violet-100 text-violet-700" },
  toggle: { label: "Ativou/Desativou", color: "bg-amber-100 text-amber-700" },
};

function ActionIcon({ action }: { action: string }) {
  if (action === "create") return <Plus size={12} weight="bold" />;
  if (action === "update") return <PencilSimple size={12} weight="bold" />;
  if (action === "delete") return <Trash size={12} weight="bold" />;
  if (action === "reorder") return <ArrowsClockwise size={12} weight="bold" />;
  if (action === "toggle") return <ToggleLeft size={12} weight="bold" />;
  return null;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "agora mesmo";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m atrás`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atrás`;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditList({ rows, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);

  function setFilter(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/historico?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="Tudo"
          active={!filters.entity}
          onClick={() => setFilter("entity", null)}
        />
        {Object.entries(ENTITY_LABEL).map(([key, label]) => (
          <FilterPill
            key={key}
            label={label}
            active={filters.entity === key}
            onClick={() => setFilter("entity", key)}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-ghost bg-bg-muted/40 p-8 text-center text-sm text-ink-muted">
          Nenhuma mudança registrada com esses filtros.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => {
            const isOpen = expanded === r.id;
            const action = ACTION_LABEL[r.action] ?? {
              label: r.action,
              color: "bg-ink-ghost/40 text-ink-soft",
            };
            const entityLabel = ENTITY_LABEL[r.entity_type] ?? r.entity_type;
            return (
              <li key={r.id} className="rounded-xl border border-ink-ghost bg-bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium " +
                      action.color
                    }
                  >
                    <ActionIcon action={r.action} />
                    {action.label}
                  </span>
                  <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                    {entityLabel}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      {r.entity_label ?? <span className="italic text-ink-muted">sem nome</span>}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {r.actor_email ?? r.actor_id?.slice(0, 8) ?? "—"}
                      {r.restaurant_id ? ` · ${r.restaurant_id}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{fmtDate(r.created_at)}</span>
                </button>
                {isOpen && r.details ? (
                  <div className="border-t border-ink-ghost bg-bg-muted/40 px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                      Detalhes
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-ink">
                      {JSON.stringify(r.details, null, 2)}
                    </pre>
                    {r.entity_id ? (
                      <p className="mt-2 text-[11px] text-ink-muted">
                        ID: <code className="text-ink">{r.entity_id}</code>
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1 text-xs font-medium transition " +
        (active
          ? "bg-ink text-white"
          : "border border-ink-ghost bg-bg-card text-ink hover:border-ink")
      }
    >
      {label}
    </button>
  );
}
