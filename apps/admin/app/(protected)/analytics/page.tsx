import { PageHeader } from "@/components/PageHeader";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { StatCard } from "@/components/analytics/StatCard";
import { VisitsAreaChart } from "@/components/analytics/VisitsAreaChart";
import { HourBarChart } from "@/components/analytics/HourBarChart";
import { CategoriesDonutChart } from "@/components/analytics/CategoriesDonutChart";
import { DishesBarList } from "@/components/analytics/DishesBarList";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { loadDashboard, loadCategoryOptions, type Range } from "@/lib/data/analytics";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

type SearchParams = { range?: string; category?: string };

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
  const categorySlug = searchParams.category ?? null;
  const restaurantId = getActiveRestaurantId();

  const filterCategories = await loadCategoryOptions(restaurantId);
  const categoryId = categorySlug
    ? filterCategories.find((c) => c.slug === categorySlug)?.id
    : undefined;

  const data = await loadDashboard(range, restaurantId, categoryId);

  const { stats, prevStats, insights, daySeries, hourHistogram, topCategories, topDishes } = data;

  const itemsPerVisitor =
    stats.visitors === 0 ? "0" : fmtDecimal((stats.dishImpressions + stats.dishViews) / stats.visitors);

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Analytics"
          description="Comportamento do cardápio digital — dados reais do site público."
        />
        <AnalyticsFilters
          activeRange={range}
          activeCategory={categorySlug}
          categories={filterCategories}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <InsightsPanel
        insights={insights}
        topCategoryName={topCategories[0]?.name}
        topDishName={topDishes[0]?.name}
        engagementPct={fmtPct(stats.engagementRate)}
        itemsPerVisitor={itemsPerVisitor}
        itemsPerSession={fmtDecimal(stats.itemsPerVisit)}
        hasData={stats.views > 0}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <VisitsAreaChart points={daySeries} />
        <HourBarChart hours={hourHistogram} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoriesDonutChart categories={topCategories} />
        <DishesBarList dishes={topDishes} />
      </div>
    </section>
  );
}
