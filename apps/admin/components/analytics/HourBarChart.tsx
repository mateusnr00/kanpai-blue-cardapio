"use client";

import { BarChart } from "@tremor/react";

type Props = {
  hours: number[];
};

export function HourBarChart({ hours }: Props) {
  const total = hours.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Sem dados no período.
      </div>
    );
  }

  const data = hours.map((count, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    Eventos: count,
  }));

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Horários de pico</h3>
      <BarChart
        data={data}
        index="hora"
        categories={["Eventos"]}
        colors={["blue"]}
        yAxisWidth={40}
        showAnimation
        className="h-52"
      />
    </div>
  );
}
