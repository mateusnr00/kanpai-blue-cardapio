"use client";

import { DonutChart } from "@tremor/react";
import type { CategoryRank } from "@/lib/data/analytics";
import { CHART_DONUT } from "@/lib/analytics-theme";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  categories: CategoryRank[];
};

type Slice = {
  name: string;
  cliques: number;
  people: number;
  color: string;
  pct: number;
};

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function buildSlices(categories: CategoryRank[]): { slices: Slice[]; chartData: { name: string; cliques: number }[] } {
  const top5 = categories.slice(0, 5);
  const rest = categories.slice(5);
  const othersClicks = rest.reduce((sum, c) => sum + c.clicks, 0);
  const othersPeople = rest.reduce((sum, c) => sum + c.people, 0);

  const rows = [
    ...top5.map((c) => ({ name: c.name, cliques: c.clicks, people: c.people })),
    ...(othersClicks > 0 ? [{ name: "Outros", cliques: othersClicks, people: othersPeople }] : []),
  ];

  const total = rows.reduce((s, r) => s + r.cliques, 0);

  const slices: Slice[] = rows.map((r, i) => ({
    ...r,
    color: CHART_DONUT[i % CHART_DONUT.length] ?? CHART_DONUT[0],
    pct: total > 0 ? (r.cliques / total) * 100 : 0,
  }));

  return {
    slices,
    chartData: slices.map(({ name, cliques }) => ({ name, cliques })),
  };
}

export function CategoriesDonutChart({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <ChartPanel title="Categorias mais acessadas" description="Cliques nas seções do cardápio">
        <ChartEmpty message="Nenhuma categoria aberta no período." />
      </ChartPanel>
    );
  }

  const { slices, chartData } = buildSlices(categories);
  const totalClicks = slices.reduce((s, x) => s + x.cliques, 0);

  return (
    <ChartPanel
      title="Categorias mais acessadas"
      description={`${fmt(totalClicks)} cliques no período`}
      className="flex flex-col"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative mx-auto w-full max-w-[200px] shrink-0 lg:mx-0">
          <div className="rounded-2xl bg-bg-muted/40 p-3">
            <DonutChart
              data={chartData}
              category="cliques"
              index="name"
              colors={slices.map((s) => s.color)}
              showAnimation
              showLabel={false}
              className="h-44 [&_.recharts-pie-label-line]:hidden [&_ul]:hidden"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink">
              {fmt(totalClicks)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">cliques</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1.5">
          {slices.map((slice) => (
            <li
              key={slice.name}
              className="flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition hover:border-ink-ghost hover:bg-bg-muted/50"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ backgroundColor: slice.color }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink" title={slice.name}>
                  {slice.name}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {fmt(slice.people)} {slice.people === 1 ? "pessoa" : "pessoas"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-ink">{fmt(slice.cliques)}</p>
                <p className="text-[11px] tabular-nums text-ink-muted">
                  {slice.pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ChartPanel>
  );
}
