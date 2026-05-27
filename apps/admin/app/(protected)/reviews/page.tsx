import { PageHeader } from "@/components/PageHeader";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { computeReviewStats, listReviews } from "@/lib/data/reviews";
import { ReviewsList } from "./ReviewsList";
import { MarkAllReadAction } from "./MarkAllReadAction";

function fmtAvg(n: number | null): string {
  if (n == null) return "-";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default async function ReviewsPage() {
  const restaurantId = getActiveRestaurantId();
  const reviews = await listReviews(restaurantId);
  const stats = computeReviewStats(reviews);

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Avaliações"
          description="Feedback dos clientes desta unidade, vindo do form público em /avaliacao."
        />
        {stats.unread > 0 ? <MarkAllReadAction restaurantId={restaurantId} /> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Total" value={String(stats.total)} hint={stats.unread ? `${stats.unread} novas` : "todas lidas"} />
        <StatBox label="Geral" value={fmtAvg(stats.averages.overall)} hint="média / 5" />
        <StatBox label="Comida" value={fmtAvg(stats.averages.food)} hint="média / 5" />
        <StatBox label="Atendimento" value={fmtAvg(stats.averages.service)} hint="média / 5" />
      </div>

      <DistributionBar distribution={stats.distribution} total={stats.total} />

      <ReviewsList reviews={reviews} />
    </section>
  );
}

function StatBox({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-ink-ghost bg-bg-card px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-[11px] text-ink-muted">{hint}</p>
    </div>
  );
}

function DistributionBar({
  distribution,
  total,
}: {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}) {
  if (total === 0) return null;
  return (
    <div className="rounded-xl border border-ink-ghost bg-bg-card p-4">
      <p className="mb-3 text-xs font-medium text-ink">Distribuição de notas</p>
      <div className="flex flex-col gap-2">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const n = distribution[star] ?? 0;
          const pct = total === 0 ? 0 : (n / total) * 100;
          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-6 tabular-nums text-ink-muted">{star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-muted">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.max(pct, n > 0 ? 1.5 : 0)}%` }}
                />
              </div>
              <span className="w-16 text-right tabular-nums text-ink-muted">
                {n} | {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
