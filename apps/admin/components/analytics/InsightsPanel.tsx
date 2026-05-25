import { Clock, ForkKnife, SquaresFour, TrendUp } from "@phosphor-icons/react/dist/ssr";

type Insight = {
  topCategory?: { id: string; count: number; people: number } | null;
  topDishImpression?: { slug: string; count: number; people: number } | null;
  peakHour?: { hour: number; count: number } | null;
};

type Props = {
  insights: Insight;
  topCategoryName?: string;
  topDishName?: string;
  engagementPct: string;
  itemsPerVisitor: string;
  itemsPerSession: string;
  hasData: boolean;
};

export function InsightsPanel({
  insights,
  topCategoryName,
  topDishName,
  engagementPct,
  itemsPerVisitor,
  itemsPerSession,
  hasData,
}: Props) {
  const cards = [
    insights.topCategory
      ? {
          icon: SquaresFour,
          label: "Categoria mais clicada",
          value: topCategoryName ?? insights.topCategory.id,
          detail: `${insights.topCategory.count.toLocaleString("pt-BR")} cliques · ${insights.topCategory.people.toLocaleString("pt-BR")} pessoas`,
        }
      : null,
    insights.topDishImpression
      ? {
          icon: ForkKnife,
          label: "Item mais visto",
          value: topDishName ?? insights.topDishImpression.slug,
          detail: `${insights.topDishImpression.count.toLocaleString("pt-BR")} views · ${insights.topDishImpression.people.toLocaleString("pt-BR")} pessoas`,
        }
      : null,
    insights.peakHour
      ? {
          icon: Clock,
          label: "Pico de acesso",
          value: `${String(insights.peakHour.hour).padStart(2, "0")}h`,
          detail: `${insights.peakHour.count.toLocaleString("pt-BR")} eventos`,
        }
      : null,
    {
      icon: TrendUp,
      label: "Engajamento",
      value: engagementPct,
      detail: "Visitas com pelo menos 1 item visto",
    },
    {
      icon: TrendUp,
      label: "Itens por visitante",
      value: itemsPerVisitor,
      detail: "Média de impressões + detalhes",
    },
    {
      icon: TrendUp,
      label: "Itens por sessão",
      value: itemsPerSession,
      detail: "Profundidade média da sessão",
    },
  ].filter(Boolean) as Array<{
    icon: typeof SquaresFour;
    label: string;
    value: string;
    detail: string;
  }>;

  return (
    <div className="admin-chart-panel">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">Insights rápidos</h3>
        <p className="mt-0.5 text-xs text-ink-muted">Resumo do período filtrado</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex gap-3 rounded-xl border border-ink-ghost/80 bg-bg-muted/30 px-4 py-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon size={18} weight="duotone" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{card.label}</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">{card.value}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{card.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!hasData ? (
        <p className="mt-4 rounded-xl border border-dashed border-ink-ghost bg-accent-soft/30 px-4 py-3 text-xs text-ink-secondary">
          Ainda não há eventos no período. Visite o site público e os dados aparecem aqui após alguns segundos.
        </p>
      ) : null}
    </div>
  );
}
