import { StatCard } from "./StatCard";
import {
  loadPostHogKpis,
  loadPostHogDailySeries,
  loadPostHogTopPages,
} from "@/lib/data/posthog";
import { PostHogTrendChart } from "./PostHogTrendChart";

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function fmtPct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function fmtDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}min ${String(s).padStart(2, "0")}s`;
}

export async function PostHogPanel() {
  let kpis = { visitors30d: 0, pageviews30d: 0, bounceRate30d: 0, avgSessionSeconds30d: 0 };
  let series: Awaited<ReturnType<typeof loadPostHogDailySeries>> = [];
  let topPages: Awaited<ReturnType<typeof loadPostHogTopPages>> = [];
  let error: string | null = null;

  try {
    [kpis, series, topPages] = await Promise.all([
      loadPostHogKpis(),
      loadPostHogDailySeries(),
      loadPostHogTopPages(8),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro desconhecido";
  }

  if (error) {
    return (
      <div className="admin-chart-panel">
        <p className="text-sm font-medium text-rose-700">Falha ao buscar dados do PostHog</p>
        <p className="mt-1 text-xs text-ink-muted">{error}</p>
        <p className="mt-3 text-xs text-ink-muted">
          Verifique <code className="rounded bg-bg-muted px-1.5 py-0.5">POSTHOG_API_KEY</code> e{" "}
          <code className="rounded bg-bg-muted px-1.5 py-0.5">POSTHOG_PROJECT_ID</code> no{" "}
          <code className="rounded bg-bg-muted px-1.5 py-0.5">apps/admin/.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitantes (30d)"
          value={fmt(kpis.visitors30d)}
          hint="Pessoas distintas que abriram o cardápio nos últimos 30 dias (PostHog)."
        />
        <StatCard
          label="Acessos (30d)"
          value={fmt(kpis.pageviews30d)}
          hint="Total de pageviews nos últimos 30 dias."
        />
        <StatCard
          label="Taxa de saída rápida"
          value={fmtPct(kpis.bounceRate30d)}
          hint="% das sessões que viram só uma página e foram embora. Quanto menor, melhor — sinaliza que o cardápio prendeu atenção."
        />
        <StatCard
          label="Tempo médio na página"
          value={fmtDuration(kpis.avgSessionSeconds30d)}
          hint="Duração média de cada sessão no cardápio nos últimos 30 dias."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <PostHogTrendChart points={series} />
        <div className="admin-chart-panel">
          <h3 className="text-sm font-semibold text-ink">Páginas mais vistas (30d)</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Caminho dentro do cardápio público</p>
          {topPages.length === 0 ? (
            <p className="mt-6 text-xs text-ink-muted">Sem pageviews no período.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2.5">
              {topPages.map((p) => {
                const max = topPages[0].views || 1;
                const pct = Math.max((p.views / max) * 100, 4);
                return (
                  <li key={p.path} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span
                          className="truncate text-xs font-medium text-ink"
                          title={p.path}
                        >
                          {p.path}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                          {fmt(p.views)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-bg-muted">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
