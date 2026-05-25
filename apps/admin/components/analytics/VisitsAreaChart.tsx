"use client";

import { AreaChart } from "@tremor/react";
import type { SeriesPoint } from "@/lib/data/analytics";

type Props = {
  points: SeriesPoint[];
};

function fmtDay(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function VisitsAreaChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Sem dados no período.
      </div>
    );
  }

  const data = points.map((p) => ({
    dia: fmtDay(p.day),
    Visitas: p.visits,
    "Únicos": p.uniques,
  }));

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Visitas por dia</h3>
      <AreaChart
        data={data}
        index="dia"
        categories={["Visitas", "Únicos"]}
        colors={["blue", "gray"]}
        yAxisWidth={40}
        showAnimation
        className="h-52"
        curveType="monotone"
      />
    </div>
  );
}
