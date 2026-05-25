"use client";

import { CHART_PRIMARY, CHART_ACCENT, CHART_SECONDARY, CHART_LIGHT } from "@/lib/analytics-theme";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  visitors: number;
  categoryOpens: number;
  dishImpressions: number;
  dishViews: number;
};

type Step = {
  label: string;
  hint: string;
  value: number;
  color: string;
};

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function fmtPct(n: number): string {
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function FunnelChart({ visitors, categoryOpens, dishImpressions, dishViews }: Props) {
  const total = visitors + categoryOpens + dishImpressions + dishViews;

  if (total === 0) {
    return (
      <ChartPanel title="Funil do cardápio" description="Jornada do visitante até ver detalhes">
        <ChartEmpty message="Sem eventos suficientes no período." />
      </ChartPanel>
    );
  }

  const steps: Step[] = [
    { label: "Visitantes", hint: "Pessoas distintas", value: visitors, color: CHART_PRIMARY },
    { label: "Categorias abertas", hint: "Cliques em seções", value: categoryOpens, color: CHART_ACCENT },
    { label: "Itens impressos", hint: "Pratos vistos na lista", value: dishImpressions, color: CHART_SECONDARY },
    { label: "Detalhes abertos", hint: "Cliques em \"ver mais\"", value: dishViews, color: CHART_LIGHT },
  ];

  const max = Math.max(...steps.map((s) => s.value), 1);
  const base = steps[0].value || 1;

  return (
    <ChartPanel
      title="Funil do cardápio"
      description="Jornada do visitante até ver detalhes"
      className="!p-4 sm:!p-5"
    >
      <ul className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const widthPct = (step.value / max) * 100;
          const convPct = i === 0 ? null : (step.value / base) * 100;
          const dropPct =
            i === 0 || steps[i - 1].value === 0
              ? null
              : ((steps[i - 1].value - step.value) / steps[i - 1].value) * 100;

          return (
            <li key={step.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink" title={step.label}>
                    {step.label}
                  </p>
                  <p className="truncate text-[11px] text-ink-muted">{step.hint}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-ink">{fmt(step.value)}</p>
                  {convPct != null ? (
                    <p className="text-[11px] tabular-nums text-ink-muted">
                      {fmtPct(convPct)} do topo
                      {dropPct != null && dropPct > 0 ? (
                        <span className="ml-1 text-rose-500">−{fmtPct(dropPct)}</span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="text-[11px] tabular-nums text-ink-muted">base</p>
                  )}
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(widthPct, 2)}%`, backgroundColor: step.color }}
                  aria-hidden
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ChartPanel>
  );
}
