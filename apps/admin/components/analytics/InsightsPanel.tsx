import { Clock, ForkKnife, SquaresFour, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { CHART_LABELS, STAT_LABELS } from "@/lib/analytics-labels";

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
  dishDetailsCount: number;
  itemsPerVisitor: string;
  itemsPerSession: string;
  categoryOpens: number;
  hasData: boolean;
  emptyHint: string;
};

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function InsightsPanel({
  insights,
  topCategoryName,
  topDishName,
  engagementPct,
  dishDetailsCount,
  itemsPerVisitor,
  itemsPerSession,
  categoryOpens,
  hasData,
  emptyHint,
}: Props) {
  const cards = [
    insights.topCategory
      ? {
          icon: SquaresFour,
          label: "Categoria mais aberta",
          value: topCategoryName ?? insights.topCategory.id,
          detail: `${fmt(insights.topCategory.count)} aberturas · ${fmt(insights.topCategory.people)} pessoas`,
        }
      : null,
    insights.topDishImpression
      ? {
          icon: ForkKnife,
          label: "Prato que mais apareceu na lista",
          value: topDishName ?? insights.topDishImpression.slug,
          detail: `${fmt(insights.topDishImpression.count)} vezes na tela · ${fmt(insights.topDishImpression.people)} pessoas`,
        }
      : null,
    insights.peakHour
      ? {
          icon: Clock,
          label: "Horário mais movimentado",
          value: `${String(insights.peakHour.hour).padStart(2, "0")}h`,
          detail: `${fmt(insights.peakHour.count)} ações registradas nesse horário`,
        }
      : null,
    categoryOpens > 0
      ? {
          icon: SquaresFour,
          label: "Categorias exploradas",
          value: fmt(categoryOpens),
          detail: "Total de vezes que alguém entrou em uma seção do menu",
        }
      : null,
    dishDetailsCount > 0
      ? {
          icon: ForkKnife,
          label: STAT_LABELS.dishDetails.label,
          value: fmt(dishDetailsCount),
          detail: STAT_LABELS.dishDetails.hint,
        }
      : null,
    {
      icon: TrendUp,
      label: STAT_LABELS.engagement.label,
      value: engagementPct,
      detail: STAT_LABELS.engagement.hint,
    },
    {
      icon: TrendUp,
      label: "Média por pessoa",
      value: itemsPerVisitor,
      detail: "Pratos na tela ou detalhes abertos, dividido pelo número de visitantes",
    },
    {
      icon: TrendUp,
      label: STAT_LABELS.depth.label,
      value: itemsPerSession,
      detail: STAT_LABELS.depth.hint,
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
        <h3 className="text-sm font-semibold text-ink">{CHART_LABELS.insights.title}</h3>
        <p className="mt-0.5 text-xs text-ink-muted">{CHART_LABELS.insights.description}</p>
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
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{card.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!hasData ? (
        <p className="mt-4 rounded-xl border border-dashed border-ink-ghost bg-accent-soft/30 px-4 py-3 text-xs leading-relaxed text-ink-secondary">
          {emptyHint}
        </p>
      ) : null}
    </div>
  );
}
