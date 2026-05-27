import { PageHeader } from "@/components/PageHeader";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { StatCard } from "@/components/analytics/StatCard";
import { VisitsAreaChart } from "@/components/analytics/VisitsAreaChart";
import { HourBarChart } from "@/components/analytics/HourBarChart";
import { CategoriesDonutChart } from "@/components/analytics/CategoriesDonutChart";
import { DishesBarList } from "@/components/analytics/DishesBarList";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { loadDashboard, loadCategoryOptions, type Range } from "@/lib/data/analytics";
import { ANALYTICS_PAGE, STAT_LABELS } from "@/lib/analytics-labels";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

type SearchParams = { range?: string; category?: string; detailed?: string };

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
  return `${Math.round(n * 100).toLocaleString("pt-BR")}%`;
}

/**
 * Mostra fração crua (ex: "1 de 3") quando amostra é pequena demais
 * para % fazer sentido. Acima do limiar, mostra % arredondado.
 */
function fmtRate(numerator: number, denominator: number, lowSampleThreshold = 20): string {
  if (denominator === 0) return "-";
  if (denominator < lowSampleThreshold) {
    return `${numerator} de ${denominator}`;
  }
  return fmtPct(numerator / denominator);
}

/**
 * Delta vs período anterior. Retorna null quando:
 *  - prev é ausente
 *  - prev é pequeno demais para % fazer sentido (< MIN_PREV)
 *  - prev é 0 (não há base de comparação)
 * Assim evitamos "−100%" em vermelho gritante quando a amostra mal existe.
 */
const MIN_PREV_FOR_DELTA = 5;
function delta(current: number, prev: number | undefined | null): number | null {
  if (prev == null) return null;
  if (prev < MIN_PREV_FOR_DELTA) return null;
  return (current - prev) / prev;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const range = asRange(searchParams.range);
  const categorySlug = searchParams.category ?? null;
  const detailed = searchParams.detailed === "1";
  const restaurantId = getActiveRestaurantId();

  const filterCategories = await loadCategoryOptions(restaurantId);

  const data = await loadDashboard(range, restaurantId, categorySlug ?? undefined);

  const { stats, prevStats, insights, daySeries, hourHistogram, topCategories, topDishes } = data;

  const sessionsWithDish = Math.round(stats.engagementRate * stats.sessions);
  const engagementDisplay = fmtRate(sessionsWithDish, stats.sessions);

  const hasData = stats.homeViews > 0 || stats.categoryOpens > 0 || stats.dishImpressions > 0;

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader title={ANALYTICS_PAGE.title} description={ANALYTICS_PAGE.description} />
        <AnalyticsFilters
          activeRange={range}
          activeCategory={categorySlug}
          categories={filterCategories}
          detailed={detailed}
        />
      </div>

      <div
        className={
          "grid grid-cols-1 gap-4 sm:grid-cols-2 " +
          (detailed ? "xl:grid-cols-4" : "xl:grid-cols-3")
        }
      >
        <StatCard
          label={STAT_LABELS.visitors.label}
          value={fmtNumber(stats.visitors)}
          hint={STAT_LABELS.visitors.hint}
          delta={delta(stats.visitors, prevStats?.visitors)}
        />
        <StatCard
          label={STAT_LABELS.homeViews.label}
          value={fmtNumber(stats.homeViews)}
          hint={STAT_LABELS.homeViews.hint}
          delta={delta(stats.homeViews, prevStats?.homeViews)}
        />
        <StatCard
          label={STAT_LABELS.engagement.label}
          value={engagementDisplay}
          hint={STAT_LABELS.engagement.hint}
          delta={delta(stats.engagementRate, prevStats?.engagementRate)}
        />
        {detailed ? (
          <StatCard
            label={STAT_LABELS.dishTouches.label}
            value={fmtNumber(stats.dishImpressions)}
            hint={STAT_LABELS.dishTouches.hint}
            delta={delta(stats.dishImpressions, prevStats?.dishImpressions)}
          />
        ) : null}
      </div>

      <InsightsPanel
        insights={insights}
        topCategoryName={topCategories[0]?.name}
        topDishName={topDishes[0]?.name}
        dishDetailsCount={stats.dishViews}
        itemsPerSession={fmtDecimal(stats.itemsPerVisit)}
        hasData={hasData}
        emptyHint={ANALYTICS_PAGE.emptyHint}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoriesDonutChart categories={topCategories} />
        <HourBarChart hours={hourHistogram} />
      </div>

      <DishesBarList dishes={topDishes} />

      {detailed ? (
        <>
          <VisitsAreaChart points={daySeries} />
          <FunnelChart
            visitors={stats.visitors}
            peopleOpenedCategory={stats.peopleOpenedCategory}
            peopleSawDishes={stats.peopleSawDishes}
          />
        </>
      ) : null}
    </section>
  );
}
