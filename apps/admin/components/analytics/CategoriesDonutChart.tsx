"use client";

import { DonutChart } from "@tremor/react";
import type { CategoryRank } from "@/lib/data/analytics";

type Props = {
  categories: CategoryRank[];
};

export function CategoriesDonutChart({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Nenhuma categoria foi aberta no período.
      </div>
    );
  }

  const top5 = categories.slice(0, 5);
  const rest = categories.slice(5);
  const othersClicks = rest.reduce((sum, c) => sum + c.clicks, 0);

  const data = [
    ...top5.map((c) => ({ name: c.name, cliques: c.clicks })),
    ...(othersClicks > 0 ? [{ name: "Outros", cliques: othersClicks }] : []),
  ];

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Categorias mais acessadas</h3>
      <DonutChart
        data={data}
        category="cliques"
        index="name"
        colors={["blue", "cyan", "indigo", "violet", "fuchsia", "gray"]}
        showAnimation
        className="h-52"
      />
    </div>
  );
}
