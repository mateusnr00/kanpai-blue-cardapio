import { ArrowDown, ArrowUp, Minus } from "@phosphor-icons/react/dist/ssr";

type Props = {
  label: string;
  value: string;
  hint?: string;
  delta?: number | null; // -1..+inf (-0.42 = -42%)
};

function fmtDelta(d: number): string {
  const pct = Math.round(Math.abs(d) * 100);
  return `${pct}%`;
}

export function StatCard({ label, value, hint, delta }: Props) {
  let deltaNode: React.ReactNode = null;
  if (delta != null && Number.isFinite(delta)) {
    if (Math.abs(delta) < 0.005) {
      deltaNode = (
        <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
          <Minus size={12} weight="bold" /> sem mudança
        </span>
      );
    } else if (delta > 0) {
      deltaNode = (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
          <ArrowUp size={12} weight="bold" /> {fmtDelta(delta)} vs período anterior
        </span>
      );
    } else {
      deltaNode = (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
          <ArrowDown size={12} weight="bold" /> {fmtDelta(delta)} vs período anterior
        </span>
      );
    }
  }

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">{value}</div>
      {hint ? <div className="mt-1 text-xs text-ink-muted">{hint}</div> : null}
      {deltaNode ? <div className="mt-2">{deltaNode}</div> : null}
    </div>
  );
}
