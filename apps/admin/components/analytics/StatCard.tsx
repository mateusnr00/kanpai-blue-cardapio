import { ArrowDown, ArrowUp, Info, Minus } from "@phosphor-icons/react/dist/ssr";

type Props = {
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
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
        <span className="inline-flex items-center gap-1 rounded-full bg-bg-muted px-2 py-0.5 text-xs text-ink-muted">
          <Minus size={12} weight="bold" /> igual ao período anterior
        </span>
      );
    } else if (delta > 0) {
      deltaNode = (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
          <ArrowUp size={12} weight="bold" /> {fmtDelta(delta)} vs anterior
        </span>
      );
    } else {
      deltaNode = (
        <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
          <ArrowDown size={12} weight="bold" /> {fmtDelta(delta)} vs anterior
        </span>
      );
    }
  }

  return (
    <div className="admin-stat-card">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        <span>{label}</span>
        {hint ? (
          <span
            tabIndex={0}
            role="img"
            aria-label={hint}
            title={hint}
            className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center text-ink-faint transition hover:text-accent focus:outline-none focus:text-accent"
          >
            <Info size={14} weight="regular" />
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</div>
      {deltaNode ? <div className="mt-3">{deltaNode}</div> : null}
    </div>
  );
}
