"use client";

import { AreaChart } from "@tremor/react";
import type { SeriesPoint } from "@/lib/data/analytics";
import { CHART_SERIES_TWO } from "@/lib/analytics-theme";
import { CHART_LABELS } from "@/lib/analytics-labels";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  points: SeriesPoint[];
};

function fmtDay(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function VisitsAreaChart({ points }: Props) {
  const { daySeries: labels } = CHART_LABELS;

  if (points.length === 0) {
    return (
      <ChartPanel title={labels.title} description={labels.description}>
        <ChartEmpty message={labels.empty} />
      </ChartPanel>
    );
  }

  const data = points.map((p) => ({
    dia: fmtDay(p.day),
    [labels.home]: p.visits,
    [labels.uniques]: p.uniques,
  }));

  return (
    <ChartPanel title={labels.title} description={labels.description}>
      <AreaChart
        data={data}
        index="dia"
        categories={[labels.home, labels.uniques]}
        colors={[...CHART_SERIES_TWO]}
        yAxisWidth={44}
        showAnimation
        className="h-56"
        curveType="monotone"
      />
    </ChartPanel>
  );
}
