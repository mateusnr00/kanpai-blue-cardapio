import { ChartLineUp, Eye, Globe, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/PageHeader";

const PLACEHOLDERS = [
  { label: "Views", icon: Eye, desc: "Visualizações do cardápio" },
  { label: "Pratos populares", icon: TrendUp, desc: "Itens mais acessados" },
  { label: "Origem", icon: Globe, desc: "Tráfego por canal" },
] as const;

export default function AnalyticsPage() {
  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader title="Analytics" description="Métricas e insights do cardápio digital" />

      <div className="admin-card flex items-center gap-4 border-dashed px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
          <ChartLineUp size={28} weight="duotone" className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Em breve</p>
          <p className="text-sm text-ink-muted">Integração com analytics em fase futura.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLACEHOLDERS.map(({ label, icon: Icon, desc }) => (
          <div key={label} className="admin-card p-6 opacity-60">
            <Icon size={24} weight="duotone" className="text-ink-faint" />
            <h2 className="mt-3 text-sm font-semibold text-ink">{label}</h2>
            <p className="mt-1 text-xs text-ink-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
