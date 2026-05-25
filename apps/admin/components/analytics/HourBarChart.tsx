"use client";

import { BarChart } from "@tremor/react";
import { CHART_SERIES_ONE } from "@/lib/analytics-theme";
import { CHART_LABELS } from "@/lib/analytics-labels";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  hours: number[];
};

export function HourBarChart({ hours }: Props) {
  const total = hours.reduce((a, b) => a + b, 0);
  const { hours: labels } = CHART_LABELS;

  if (total === 0) {
    return (
      <ChartPanel title={labels.title} description={labels.description}>
        <ChartEmpty message={labels.empty} />
      </ChartPanel>
    );
  }

  const data = hours.map((count, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    Acessos: count,
  }));

  return (
    <ChartPanel title={labels.title} description={labels.description}>
      <BarChart
        data={data}
        index="hora"
        categories={["Acessos"]}
        colors={[...CHART_SERIES_ONE]}
        yAxisWidth={44}
        showAnimation
        className="h-56 [&_.recharts-bar-rectangle]:fill-[#2d4ae8] [&_.recharts-bar-rectangle]:opacity-90"
      />
    </ChartPanel>
  );
}
