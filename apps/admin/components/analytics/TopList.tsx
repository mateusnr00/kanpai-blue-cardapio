type Item = {
  key: string;
  label: string;
  primary: number;
  primaryLabel: string;
  secondary?: number;
  secondaryLabel?: string;
};

type Props = {
  title: string;
  emptyHint: string;
  items: Item[];
  limit?: number;
};

export function TopList({ title, emptyHint, items, limit = 10 }: Props) {
  const limited = items.slice(0, limit);
  const max = limited.reduce((m, it) => Math.max(m, it.primary), 0) || 1;

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {limited.length === 0 ? (
        <p className="mt-3 text-xs text-ink-muted">{emptyHint}</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-2">
          {limited.map((it, idx) => {
            const pct = (it.primary / max) * 100;
            return (
              <li key={it.key} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-baseline gap-2 truncate">
                    <span className="w-5 font-mono text-[10px] text-ink-muted">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{it.label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {it.primary} {it.primaryLabel}
                    {it.secondary != null ? (
                      <span className="ml-2">· {it.secondary} {it.secondaryLabel}</span>
                    ) : null}
                  </span>
                </div>
                <div className="ml-7 h-1 overflow-hidden rounded-full bg-ink-ghost">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${Math.max(2, pct).toFixed(1)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
