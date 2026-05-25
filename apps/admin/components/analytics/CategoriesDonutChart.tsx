"use client";

import type { CategoryRank } from "@/lib/data/analytics";
import { CHART_DONUT, CHART_MUTED } from "@/lib/analytics-theme";
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

function buildSlices(categories: CategoryRank[]): Slice[] {
  const top5 = categories.slice(0, 5);
  const rest = categories.slice(5);
  const othersClicks = rest.reduce((sum, c) => sum + c.clicks, 0);
  const othersPeople = rest.reduce((sum, c) => sum + c.people, 0);

  const rows = [
    ...top5.map((c) => ({ name: c.name, cliques: c.clicks, people: c.people })),
    ...(othersClicks > 0 ? [{ name: "Outros", cliques: othersClicks, people: othersPeople }] : []),
  ];

  const total = rows.reduce((s, r) => s + r.cliques, 0);

  return rows.map((r, i) => ({
    ...r,
    color: CHART_DONUT[i % CHART_DONUT.length] ?? CHART_DONUT[0],
    pct: total > 0 ? (r.cliques / total) * 100 : 0,
  }));
}

function conicGradient(slices: Slice[]): string {
  if (slices.length === 0) return CHART_MUTED;
  let acc = 0;
  const stops = slices.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
}

function CategoryDonut({ slices, total }: { slices: Slice[]; total: number }) {
  return (
    <div className="relative h-[7.5rem] w-[7.5rem] shrink-0">
      <div
        className="h-full w-full rounded-full shadow-inner ring-1 ring-ink-ghost/60"
        style={{ background: conicGradient(slices) }}
        role="img"
        aria-label={`Distribuição de ${fmt(total)} cliques por categoria`}
      />
      <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full bg-bg-surface shadow-sm ring-1 ring-ink-ghost/40">
        <span className="text-xl font-semibold tabular-nums leading-none text-ink">{fmt(total)}</span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-ink-muted">cliques</span>
      </div>
    </div>
  );
}

export function CategoriesDonutChart({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <ChartPanel title="Categorias mais acessadas" description="Cliques nas seções do cardápio">
        <ChartEmpty message="Nenhuma categoria aberta no período." />
      </ChartPanel>
    );
  }

  const slices = buildSlices(categories);
  const totalClicks = slices.reduce((s, x) => s + x.cliques, 0);

  return (
    <ChartPanel
      title="Categorias mais acessadas"
      description={`${fmt(totalClicks)} cliques · ${slices.length} ${slices.length === 1 ? "categoria" : "categorias"}`}
      className="!p-4 sm:!p-5"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <CategoryDonut slices={slices} total={totalClicks} />

        <ul className="min-w-0 flex-1 divide-y divide-ink-ghost/80">
          {slices.map((slice) => (
            <li key={slice.name} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink" title={slice.name}>
                {slice.name}
              </span>
              <span className="shrink-0 text-right text-xs tabular-nums text-ink-muted">
                <span className="font-semibold text-ink">{fmt(slice.cliques)}</span>
                {" · "}
                {slice.pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartPanel>
  );
}
