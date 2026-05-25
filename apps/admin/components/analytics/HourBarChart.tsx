"use client";

import { BarChart } from "@tremor/react";
import { CHART_SERIES_ONE } from "@/lib/analytics-theme";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  hours: number[];
};

export function HourBarChart({ hours }: Props) {
  const total = hours.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <ChartPanel title="Horários de pico" description="Distribuição por hora do dia">
        <ChartEmpty message="Sem dados no período." />
      </ChartPanel>
    );
  }

  const data = hours.map((count, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    Eventos: count,
  }));

  return (
    <ChartPanel title="Horários de pico" description="Distribuição por hora do dia">
      <BarChart
        data={data}
        index="hora"
        categories={["Eventos"]}
        colors={[...CHART_SERIES_ONE]}
        yAxisWidth={44}
        showAnimation
        className="h-56 [&_.recharts-bar-rectangle]:fill-[#2d4ae8] [&_.recharts-bar-rectangle]:opacity-90"
      />
    </ChartPanel>
  );
}
