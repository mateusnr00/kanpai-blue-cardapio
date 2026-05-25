import type { SeriesPoint } from "@/lib/data/analytics";

type Props = {
  points: SeriesPoint[];
};

const W = 720;
const H = 180;
const PADDING_X = 32;
const PADDING_Y = 24;

function buildPath(values: number[], max: number): string {
  if (values.length === 0) return "";
  const stepX = (W - PADDING_X * 2) / Math.max(values.length - 1, 1);
  const range = max || 1;
  return values
    .map((v, i) => {
      const x = PADDING_X + i * stepX;
      const y = H - PADDING_Y - ((v / range) * (H - PADDING_Y * 2));
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function fmtDayLabel(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function DayChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Sem dados no período.
      </div>
    );
  }

  const visits = points.map((p) => p.visits);
  const uniques = points.map((p) => p.uniques);
  const max = Math.max(1, ...visits, ...uniques);

  const labelFirst = fmtDayLabel(points[0].day);
  const labelLast = fmtDayLabel(points[points.length - 1].day);
  const totalVisits = visits.reduce((a, b) => a + b, 0);
  const totalUniques = uniques.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">Visitas por dia</h3>
        <div className="text-xs text-ink-muted">
          <span className="mr-3"><span className="mr-1 inline-block h-2 w-3 bg-ink align-middle" /> Visitas</span>
          <span><span className="mr-1 inline-block h-2 w-3 align-middle" style={{ borderTop: "1.5px dashed var(--ink)" }} /> Únicos</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-44 w-full" role="img" aria-label="Visitas por dia">
        {/* eixos sutis */}
        <line x1={PADDING_X} y1={H - PADDING_Y} x2={W - PADDING_X} y2={H - PADDING_Y} stroke="var(--ink-faint)" strokeWidth="0.5" />
        {/* área visitas */}
        <path d={`${buildPath(visits, max)} L${W - PADDING_X},${H - PADDING_Y} L${PADDING_X},${H - PADDING_Y} Z`} fill="var(--ink)" fillOpacity="0.08" />
        {/* linha visitas */}
        <path d={buildPath(visits, max)} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        {/* linha unicos (tracejada) */}
        <path d={buildPath(uniques, max)} fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
        <span>{labelFirst}</span>
        <span>
          {totalVisits} visitas · {totalUniques} únicos
        </span>
        <span>{labelLast}</span>
      </div>
    </div>
  );
}
