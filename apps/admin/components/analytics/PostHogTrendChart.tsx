"use client";

import { AreaChart } from "@tremor/react";
import { CHART_SERIES_TWO } from "@/lib/analytics-theme";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Point = { day: string; pageviews: number; visitors: number };

type Props = {
  points: Point[];
};

function fmtDay(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function PostHogTrendChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <ChartPanel title="Movimento por dia (PostHog)" description="Pageviews e visitantes nos últimos 30 dias">
        <ChartEmpty message="Sem pageviews no período." />
      </ChartPanel>
    );
  }

  const data = points.map((p) => ({
    dia: fmtDay(p.day),
    Acessos: p.pageviews,
    Visitantes: p.visitors,
  }));

  return (
    <ChartPanel title="Movimento por dia (PostHog)" description="Pageviews e visitantes nos últimos 30 dias">
      <AreaChart
        data={data}
        index="dia"
        categories={["Acessos", "Visitantes"]}
        colors={[...CHART_SERIES_TWO]}
        yAxisWidth={44}
        showAnimation
        className="h-56"
        curveType="monotone"
      />
    </ChartPanel>
  );
}
