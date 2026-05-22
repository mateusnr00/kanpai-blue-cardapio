export default function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="text-sm text-ink-soft">Em breve.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Views", "Pratos populares", "Origem"].map((label) => (
          <div
            key={label}
            className="rounded-md border border-ink-faint bg-bg-card p-6 opacity-50"
          >
            <h2 className="text-sm font-medium">{label}</h2>
            <p className="mt-2 text-xs text-ink-soft">Fase futura.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
