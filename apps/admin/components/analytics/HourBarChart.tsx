"use client";

import { useState } from "react";
import { BarChart } from "@tremor/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CHART_SERIES_ONE } from "@/lib/analytics-theme";
import { CHART_LABELS } from "@/lib/analytics-labels";
import { fetchHourHistogram } from "@/app/(protected)/analytics/actions";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  /** Histograma do dia inicial (hoje), já calculado no servidor. */
  initialHours: number[];
  /** Dia inicial exibido — YYYY-MM-DD no fuso de Brasília (hoje). */
  initialDay: string;
  /** Hoje em Brasília — limite superior da navegação. */
  today: string;
  categorySlug?: string | null;
};

/** Soma/subtrai dias a uma data civil YYYY-MM-DD (sem efeitos de fuso). */
function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

const WEEKDAY_FMT = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" });
const DATE_FMT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", timeZone: "UTC" });

/** Rótulo amigável do dia: "Hoje • qui, 28 de maio". */
function formatLabel(iso: string, today: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const weekday = WEEKDAY_FMT.format(dt);
  const date = DATE_FMT.format(dt);
  const prefix = iso === today ? "Hoje" : iso === addDays(today, -1) ? "Ontem" : null;
  const full = `${weekday}, ${date}`;
  return prefix ? `${prefix} · ${full}` : full;
}

export function HourBarChart({ initialHours, initialDay, today, categorySlug }: Props) {
  const [day, setDay] = useState(initialDay);
  const [hours, setHours] = useState(initialHours);
  const [loading, setLoading] = useState(false);
  const { hours: labels } = CHART_LABELS;

  const isToday = day >= today;
  const total = hours.reduce((a, b) => a + b, 0);

  async function go(delta: number) {
    const next = addDays(day, delta);
    if (next > today || loading) return;
    setDay(next);
    setLoading(true);
    try {
      setHours(await fetchHourHistogram(next, categorySlug ?? null));
    } finally {
      setLoading(false);
    }
  }

  const data = hours.map((count, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    Acessos: count,
  }));

  const navBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-ghost bg-bg-surface text-ink-muted transition hover:border-accent/40 hover:bg-accent-soft/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-ghost disabled:hover:bg-bg-surface disabled:hover:text-ink-muted";

  return (
    <ChartPanel title={labels.title} description={labels.description}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={loading}
          className={navBtn}
          aria-label="Dia anterior"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <span
          className={
            "text-center text-sm font-medium capitalize text-ink transition " +
            (loading ? "opacity-50" : "")
          }
        >
          {formatLabel(day, today)}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={loading || isToday}
          className={navBtn}
          aria-label="Próximo dia"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      {total === 0 ? (
        <ChartEmpty message={labels.empty} />
      ) : (
        <BarChart
          data={data}
          index="hora"
          categories={["Acessos"]}
          colors={[...CHART_SERIES_ONE]}
          yAxisWidth={44}
          showAnimation
          className="h-56 [&_.recharts-bar-rectangle]:fill-[#2d4ae8] [&_.recharts-bar-rectangle]:opacity-90"
        />
      )}
    </ChartPanel>
  );
}
