import { PageHeader } from "@/components/PageHeader";
import { RangeSelector } from "@/components/analytics/RangeSelector";
import { StatCard } from "@/components/analytics/StatCard";
import { DayChart } from "@/components/analytics/DayChart";
import { HourHistogram } from "@/components/analytics/HourHistogram";
import { TopList } from "@/components/analytics/TopList";
import { loadDashboard, type Range } from "@/lib/data/analytics";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

type SearchParams = { range?: string };

const VALID_RANGES: Range[] = ["today", "yesterday", "7d", "30d", "90d", "all"];

function asRange(input: string | undefined): Range {
  return VALID_RANGES.includes(input as Range) ? (input as Range) : "7d";
}

function fmtNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

function fmtDecimal(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function fmtPct(n: number): string {
  return `${(n * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function delta(current: number, prev: number | undefined | null): number | null {
  if (prev == null) return null;
  if (prev === 0) return current === 0 ? 0 : null;
  return (current - prev) / prev;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const range = asRange(searchParams.range);
  const restaurantId = getActiveRestaurantId();
  const data = await loadDashboard(range, restaurantId);
  const { stats, prevStats, insights, daySeries, hourHistogram, topCategories, topDishes } = data;

  return (
    <section className="flex w-full flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Comportamento do cardápio digital — dados reais do site público."
      />

      <RangeSelector active={range} />

      {/* 4 cards principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visitantes únicos"
          value={fmtNumber(stats.visitors)}
          hint="Pessoas distintas (cookie)"
          delta={delta(stats.visitors, prevStats?.visitors)}
        />
        <StatCard
          label="Views de itens"
          value={fmtNumber(stats.dishImpressions + stats.dishViews)}
          hint={`${fmtNumber(stats.dishImpressions)} impressões · ${fmtNumber(stats.dishViews)} ver detalhes`}
          delta={delta(
            stats.dishImpressions + stats.dishViews,
            prevStats ? prevStats.dishImpressions + prevStats.dishViews : null
          )}
        />
        <StatCard
          label="Itens por visita"
          value={fmtDecimal(stats.itemsPerVisit)}
          hint="Profundidade média"
          delta={delta(stats.itemsPerVisit, prevStats?.itemsPerVisit)}
        />
        <StatCard
          label="Engajamento"
          value={fmtPct(stats.engagementRate)}
          hint="Sessões com ≥1 item visto"
          delta={delta(stats.engagementRate, prevStats?.engagementRate)}
        />
      </div>

      {/* Insights rapidos */}
      <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
        <h3 className="text-sm font-medium text-ink">Insights rápidos</h3>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
          {insights.topCategory ? (
            <li>
              · Categoria mais clicada: <strong className="text-ink">{topCategories[0]?.name ?? insights.topCategory.id}</strong>{" "}
              ({fmtNumber(insights.topCategory.count)} cliques · {fmtNumber(insights.topCategory.people)} pessoas)
            </li>
          ) : null}
          {insights.topDishImpression ? (
            <li>
              · Item mais visto: <strong className="text-ink">{topDishes[0]?.name ?? insights.topDishImpression.slug}</strong>{" "}
              ({fmtNumber(insights.topDishImpression.count)} views · {fmtNumber(insights.topDishImpression.people)} pessoas)
            </li>
          ) : null}
          {insights.peakHour ? (
            <li>
              · Maior pico de acesso: <strong className="text-ink">{String(insights.peakHour.hour).padStart(2, "0")}h</strong>{" "}
              ({fmtNumber(insights.peakHour.count)} eventos)
            </li>
          ) : null}
          <li>
            · Taxa de engajamento: <strong className="text-ink">{fmtPct(stats.engagementRate)}</strong> das visitas clicaram em pelo menos um item.
          </li>
          <li>
            · Cada visitante viu em média{" "}
            <strong className="text-ink">
              {stats.visitors === 0 ? "0" : fmtDecimal((stats.dishImpressions + stats.dishViews) / stats.visitors)}
            </strong>{" "}
            itens.
          </li>
          <li>
            · Cada sessão gerou em média <strong className="text-ink">{fmtDecimal(stats.itemsPerVisit)}</strong> visualizações de itens.
          </li>
        </ul>
        {stats.views === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-ink-faint bg-bg-warm p-3 text-xs text-ink-muted">
            Ainda não há eventos no período selecionado. Visite o site público (em outra aba ou outro dispositivo) e os dados aparecem aqui após alguns segundos.
          </p>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <DayChart points={daySeries} />
        <HourHistogram hours={hourHistogram} />
      </div>

      {/* Top lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopList
          title="Top categorias por cliques"
          emptyHint="Nenhuma categoria foi aberta no período."
          items={topCategories.map((c) => ({
            key: c.id,
            label: c.name,
            primary: c.clicks,
            primaryLabel: c.clicks === 1 ? "clique" : "cliques",
            secondary: c.people,
            secondaryLabel: c.people === 1 ? "pessoa" : "pessoas",
          }))}
        />
        <TopList
          title="Top itens por views"
          emptyHint="Nenhum item foi visualizado no período."
          items={topDishes.map((d) => ({
            key: d.slug,
            label: d.name,
            primary: d.impressions,
            primaryLabel: d.impressions === 1 ? "view" : "views",
            secondary: d.people,
            secondaryLabel: d.people === 1 ? "pessoa" : "pessoas",
          }))}
        />
      </div>
    </section>
  );
}
