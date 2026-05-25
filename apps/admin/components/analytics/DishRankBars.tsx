"use client";

import type { DishRank } from "@/lib/data/analytics";
import { CHART_BAR_TOP10, CHART_PRIMARY } from "@/lib/analytics-theme";

const PREVIEW_COUNT = 10;

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

type BarProps = {
  dish: DishRank;
  max: number;
  color: string;
  rank: number;
};

function DishBar({ dish, max, color, rank }: BarProps) {
  const pct = max > 0 ? Math.max((dish.impressions / max) * 100, 4) : 0;

  return (
    <li className="flex items-center gap-3">
      <span className="w-5 shrink-0 text-right text-[11px] font-semibold tabular-nums text-ink-faint">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-ink" title={dish.name}>
            {dish.name}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-ink-muted">{fmt(dish.impressions)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </li>
  );
}

type ListProps = {
  dishes: DishRank[];
  limit?: number;
};

export function DishRankBars({ dishes, limit }: ListProps) {
  if (dishes.length === 0) return null;

  const list = limit != null ? dishes.slice(0, limit) : dishes;
  const max = list[0]?.impressions ?? 1;

  return (
    <ul className="flex flex-col gap-3">
      {list.map((dish, i) => (
        <DishBar
          key={dish.slug}
          dish={dish}
          max={max}
          rank={i + 1}
          color={CHART_BAR_TOP10[i % CHART_BAR_TOP10.length] ?? CHART_PRIMARY}
        />
      ))}
    </ul>
  );
}

export const DISH_RANK_PREVIEW = PREVIEW_COUNT;
