import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ChartPanel({ title, description, children, className }: Props) {
  return (
    <div className={`admin-chart-panel ${className ?? ""}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-ink-ghost bg-bg-muted/40 text-sm text-ink-muted">
      {message}
    </div>
  );
}
