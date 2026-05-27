"use client";

import { useMemo, useState } from "react";
import { Calendar, CalendarX } from "@phosphor-icons/react";

type Props = {
  /** YYYY-MM-DD ou null */
  initialStart: string | null;
  initialEnd: string | null;
  initialOffDays: number[] | null;
  /** Prefixo dos hidden inputs no FormData. Default: "schedule" */
  prefix?: string;
};

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function todayIso(): string {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return tz.toISOString().slice(0, 10);
}

function fmtBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

function previewLabel(
  start: string,
  end: string,
  offDays: number[],
): { label: string; tone: "active" | "scheduled" | "expired" | "always" } {
  const hoje = todayIso();
  const dow = new Date(`${hoje}T12:00:00`).getDay();

  if (!start && !end && offDays.length === 0) {
    return { label: "Aparece todos os dias", tone: "always" };
  }
  if (end && end < hoje) {
    return { label: `Encerrou em ${fmtBR(end)}`, tone: "expired" };
  }
  if (start && start > hoje) {
    return { label: `Começa em ${fmtBR(start)}`, tone: "scheduled" };
  }
  if (offDays.includes(dow)) {
    return { label: "Hoje está off (dia da semana)", tone: "scheduled" };
  }
  const range =
    start && end
      ? `${fmtBR(start)} → ${fmtBR(end)}`
      : start
        ? `a partir de ${fmtBR(start)}`
        : end
          ? `até ${fmtBR(end)}`
          : "sempre";
  const off =
    offDays.length > 0
      ? ` · off: ${offDays
          .sort()
          .map((d) => DAY_LABELS[d])
          .join(", ")}`
      : "";
  return { label: `Ativa (${range})${off}`, tone: "active" };
}

export function ScheduleEditor({
  initialStart,
  initialEnd,
  initialOffDays,
  prefix = "schedule",
}: Props) {
  const [start, setStart] = useState(initialStart ?? "");
  const [end, setEnd] = useState(initialEnd ?? "");
  const [offDays, setOffDays] = useState<number[]>(initialOffDays ?? []);

  const preview = useMemo(() => previewLabel(start, end, offDays), [start, end, offDays]);
  const hasSchedule = !!(start || end || offDays.length > 0);

  function toggleDay(d: number) {
    setOffDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  function clearAll() {
    setStart("");
    setEnd("");
    setOffDays([]);
  }

  const toneClass = {
    active: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-amber-100 text-amber-700",
    expired: "bg-rose-100 text-rose-700",
    always: "bg-ink-ghost/40 text-ink-soft",
  }[preview.tone];

  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="flex items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        <Calendar size={14} weight="duotone" />
        Programação
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Deixe vazio pra aparecer sempre. Configure janela de datas e/ou dias off pra programar.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefix}_start`} className="admin-label">
            Início <span className="text-ink-soft">(opcional)</span>
          </label>
          <input
            id={`${prefix}_start`}
            name={`${prefix}_start`}
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            max={end || undefined}
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${prefix}_end`} className="admin-label">
            Fim <span className="text-ink-soft">(opcional)</span>
          </label>
          <input
            id={`${prefix}_end`}
            name={`${prefix}_end`}
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            min={start || undefined}
            className="admin-input"
          />
        </div>
      </div>

      <div className="mt-3">
        <span className="admin-label">Dias da semana off (não aparece nesses dias)</span>
        <div className="mt-1.5 grid grid-cols-7 gap-1">
          {DAY_LABELS.map((label, idx) => {
            const active = offDays.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDay(idx)}
                className={
                  "rounded-md border px-2 py-2 text-xs font-medium transition " +
                  (active
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-ink-ghost bg-bg-card text-ink hover:border-ink")
                }
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* serializacao pro FormData */}
      <input type="hidden" name={`${prefix}_off_days`} value={offDays.join(",")} readOnly />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium " +
            toneClass
          }
        >
          {preview.tone === "expired" ? <CalendarX size={11} weight="bold" /> : <Calendar size={11} weight="bold" />}
          {preview.label}
        </span>
        {hasSchedule ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-ink-soft hover:text-ink"
          >
            Limpar programação
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
