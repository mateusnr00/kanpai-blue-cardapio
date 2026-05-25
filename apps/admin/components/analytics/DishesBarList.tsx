"use client";

import { BarList } from "@tremor/react";
import type { DishRank } from "@/lib/data/analytics";

type Props = {
  dishes: DishRank[];
};

export function DishesBarList({ dishes }: Props) {
  if (dishes.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Nenhum item foi visualizado no período.
      </div>
    );
  }

  const data = dishes.slice(0, 10).map((d) => ({
    name: d.name,
    value: d.impressions,
  }));

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Itens mais vistos</h3>
      <BarList
        data={data}
        color="blue"
        showAnimation
        className="h-52 overflow-y-auto"
      />
    </div>
  );
}
