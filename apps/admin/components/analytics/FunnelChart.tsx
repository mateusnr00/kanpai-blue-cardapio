"use client";

import { CHART_PRIMARY, CHART_ACCENT, CHART_SECONDARY, CHART_LIGHT } from "@/lib/analytics-theme";
import { ChartEmpty, ChartPanel } from "./ChartPanel";

type Props = {
  visitors: number;
  peopleOpenedCategory: number;
  peopleSawDishes: number;
  peopleOpenedDetails: number;
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

export function FunnelChart({
  visitors,
  peopleOpenedCategory,
  peopleSawDishes,
  peopleOpenedDetails,
}: Props) {
  if (visitors === 0) {
    return (
      <ChartPanel title="Funil do cardápio" description="De cada visitante, quantos avançaram em cada etapa">
        <ChartEmpty message="Sem visitantes neste período." />
      </ChartPanel>
    );
  }

  const steps: Step[] = [
    { label: "Visitantes", hint: "Pessoas que abriram o cardápio", value: visitors, color: CHART_PRIMARY },
    { label: "Entraram numa categoria", hint: "Pessoas que clicaram em alguma seção", value: peopleOpenedCategory, color: CHART_ACCENT },
    { label: "Chegaram a ver pratos", hint: "Pessoas que rolaram a lista", value: peopleSawDishes, color: CHART_SECONDARY },
    { label: "Clicaram em \"ver mais\"", hint: "Pessoas que abriram detalhes de um prato", value: peopleOpenedDetails, color: CHART_LIGHT },
  ];

  const base = steps[0].value;

  return (
    <ChartPanel
      title="Funil do cardápio"
      description="De cada visitante, quantos avançaram em cada etapa"
      className="!p-4 sm:!p-5"
    >
      <ul className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const convPct = (step.value / base) * 100;
          const widthPct = convPct; // sempre <= 100 porque step.value <= base (pessoas únicas)
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
                  {i === 0 ? (
                    <p className="text-[11px] tabular-nums text-ink-muted">100% (base)</p>
                  ) : (
                    <p className="text-[11px] tabular-nums text-ink-muted">
                      {fmtPct(convPct)} dos visitantes
                      {dropPct != null && dropPct > 0 ? (
                        <span className="ml-1 text-rose-500">−{fmtPct(dropPct)}</span>
                      ) : null}
                    </p>
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
