import {
  ArrowSquareOut,
  ChartBar,
  Fire,
  FunnelSimple,
  Info,
  VideoCamera,
  Flask,
} from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PostHogPanel } from "@/components/analytics/PostHogPanel";
import { isPostHogApiConfigured } from "@/lib/data/posthog";

const PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "";
const POSTHOG_BASE = process.env.NEXT_PUBLIC_POSTHOG_APP_URL ?? "https://us.posthog.com";

function projectUrl(path: string): string {
  if (!PROJECT_TOKEN) return `${POSTHOG_BASE}${path}`;
  return `${POSTHOG_BASE}/project/${PROJECT_TOKEN}${path}`;
}

const LINKS = [
  {
    label: "Sessões gravadas",
    description: "Veja visitantes navegando o cardápio em tempo real (replay).",
    icon: VideoCamera,
    path: "/replay/home",
  },
  {
    label: "Heatmaps",
    description: "Mapa de calor com onde as pessoas clicam e param de rolar.",
    icon: Fire,
    path: "/heatmaps",
  },
  {
    label: "Funis avançados",
    description: "Construa funis customizados (ex: viu prato X → clicou em Y).",
    icon: FunnelSimple,
    path: "/insights/new?insight=FUNNELS",
  },
  {
    label: "Eventos ao vivo",
    description: "Stream em tempo real de toda ação capturada no site.",
    icon: ChartBar,
    path: "/activity/explore",
  },
] as const;

export default function ComportamentoPage() {
  const linksConfigured = PROJECT_TOKEN !== "";
  const apiConfigured = isPostHogApiConfigured();

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Comportamento"
        description="Métricas agregadas do PostHog e atalhos para gravações de sessão, heatmaps e funis avançados."
      />

      <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm leading-relaxed text-violet-900">
        <Flask size={20} weight="duotone" className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Em teste e validação</p>
          <p className="mt-1 text-violet-800">
            Esta área ainda está em fase de testes. As métricas e atalhos podem mudar
            sem aviso e alguns números podem não estar 100% consolidados.
          </p>
        </div>
      </div>

      {!linksConfigured ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          <Info size={20} weight="duotone" className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">PostHog ainda não configurado</p>
            <p className="mt-1 text-amber-800">
              Defina <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN</code>{" "}
              no <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">apps/admin/.env.local</code>{" "}
              com o token do projeto (visível na URL do PostHog) para ativar os atalhos abaixo.
            </p>
          </div>
        </div>
      ) : null}

      {apiConfigured ? (
        <Suspense fallback={<PanelSkeleton />}>
          <PostHogPanel />
        </Suspense>
      ) : (
        <div className="admin-chart-panel">
          <div className="flex items-start gap-3 text-sm leading-relaxed text-ink-secondary">
            <Info size={20} weight="duotone" className="mt-0.5 shrink-0 text-ink-muted" />
            <div>
              <p className="font-medium text-ink">Métricas server-side desativadas</p>
              <p className="mt-1 text-ink-muted">
                Defina <code className="rounded bg-bg-muted px-1.5 py-0.5 text-xs">POSTHOG_API_KEY</code> e{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5 text-xs">POSTHOG_PROJECT_ID</code>{" "}
                no <code className="rounded bg-bg-muted px-1.5 py-0.5 text-xs">apps/admin/.env.local</code>.
                Crie a key em{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5 text-xs">posthog.com/settings/user-api-keys</code>{" "}
                com scopes Read em query e insight.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={projectUrl(link.path)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-ink-ghost bg-bg-surface px-5 py-4 shadow-sm transition hover:border-accent/40 hover:bg-accent-soft/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon size={20} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{link.label}</p>
                  <ArrowSquareOut size={14} weight="bold" className="text-ink-faint transition group-hover:text-accent" />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{link.description}</p>
              </div>
            </a>
          );
        })}
      </div>

    </section>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="admin-stat-card animate-pulse">
            <div className="h-3 w-24 rounded bg-bg-muted" />
            <div className="mt-3 h-8 w-16 rounded bg-bg-muted" />
          </div>
        ))}
      </div>
      <div className="admin-chart-panel h-64 animate-pulse" />
    </div>
  );
}
