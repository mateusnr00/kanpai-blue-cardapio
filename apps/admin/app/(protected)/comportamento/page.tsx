import {
  ArrowSquareOut,
  ChartBar,
  Eye,
  Fire,
  FunnelSimple,
  Info,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/PageHeader";

const PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? "";
const POSTHOG_BASE = process.env.NEXT_PUBLIC_POSTHOG_APP_URL ?? "https://us.posthog.com";
const DASHBOARD_URL = process.env.NEXT_PUBLIC_POSTHOG_DASHBOARD_URL ?? "";

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
  const isConfigured = PROJECT_TOKEN !== "";

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Comportamento"
        description="Análise qualitativa do cardápio: gravações de sessão, heatmaps e funis avançados via PostHog."
      />

      {!isConfigured ? (
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

      {DASHBOARD_URL ? (
        <div className="admin-chart-panel">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Dashboard incorporado</h3>
              <p className="mt-0.5 text-xs text-ink-muted">Compartilhado direto do PostHog</p>
            </div>
            <a
              href={DASHBOARD_URL.replace("/embedded/", "/shared/")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              Abrir em nova aba <ArrowSquareOut size={12} weight="bold" />
            </a>
          </div>
          <div className="overflow-hidden rounded-xl border border-ink-ghost">
            <iframe
              src={DASHBOARD_URL}
              title="PostHog dashboard"
              className="h-[640px] w-full"
              loading="lazy"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      ) : (
        <div className="admin-chart-panel">
          <div className="flex items-start gap-3 text-sm leading-relaxed text-ink-secondary">
            <Eye size={20} weight="duotone" className="mt-0.5 shrink-0 text-ink-muted" />
            <div>
              <p className="font-medium text-ink">Dashboard incorporado (opcional)</p>
              <p className="mt-1 text-ink-muted">
                No PostHog: crie um Dashboard, clique em <strong>Share</strong>, ative{" "}
                <strong>Public access</strong> e cole a URL em{" "}
                <code className="rounded bg-bg-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_POSTHOG_DASHBOARD_URL</code>.
                O dashboard aparecerá aqui dentro do admin.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
