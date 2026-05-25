"use client";

import { AreaChart } from "@tremor/react";
import type { SeriesPoint } from "@/lib/data/analytics";
import { CHART_SERIES_TWO } from "@/lib/analytics-theme";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

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
      <ChartPanel title="Visitas por dia" description="Total de pageviews e visitantes únicos">
        <ChartEmpty message="Sem dados no período." />
      </ChartPanel>
    );
  }

  const data = points.map((p) => ({
    dia: fmtDay(p.day),
    Visitas: p.visits,
    "Únicos": p.uniques,
  }));

  return (
    <ChartPanel title="Visitas por dia" description="Total de pageviews e visitantes únicos">
      <AreaChart
        data={data}
        index="dia"
        categories={["Visitas", "Únicos"]}
        colors={[...CHART_SERIES_TWO]}
        yAxisWidth={44}
        showAnimation
        className="h-56"
        curveType="monotone"
      />
    </ChartPanel>
  );
}
