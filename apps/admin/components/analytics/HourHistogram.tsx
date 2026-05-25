type Props = {
  hours: number[]; // length 24
};

const W = 360;
const H = 180;
const PADDING_X = 24;
const PADDING_Y = 24;

export function HourHistogram({ hours }: Props) {
  const max = Math.max(1, ...hours);
  const total = hours.reduce((a, b) => a + b, 0);
  const peakIdx = hours.reduce((best, v, i) => (v > hours[best] ? i : best), 0);
  const barWidth = (W - PADDING_X * 2) / 24 - 1.5;

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Sem dados no período.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">Pico por hora do dia</h3>
        <div className="text-xs text-ink-muted">Pico: <span className="font-medium text-ink">{String(peakIdx).padStart(2, "0")}h</span></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-44 w-full" role="img" aria-label="Eventos por hora">
        <line x1={PADDING_X} y1={H - PADDING_Y} x2={W - PADDING_X} y2={H - PADDING_Y} stroke="var(--ink-faint)" strokeWidth="0.5" />
        {hours.map((v, i) => {
          const x = PADDING_X + i * ((W - PADDING_X * 2) / 24);
          const h = (v / max) * (H - PADDING_Y * 2);
          const y = H - PADDING_Y - h;
          const isPeak = i === peakIdx;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              fill="var(--ink)"
              fillOpacity={isPeak ? 1 : 0.55}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
        <span>00h</span>
        <span>12h</span>
        <span>23h</span>
      </div>
    </div>
  );
}
