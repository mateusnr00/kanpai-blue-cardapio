/**
 * Filtro de programacao (start/end/off_days) avaliado em horario de Brasilia.
 * Aplicado em runtime fora do cache do unstable_cache.
 */

export type Schedule = {
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_off_days: number[] | null;
};

const TZ = "America/Sao_Paulo";

function getBrasiliaToday(now: Date = new Date()): {
  yyyymmdd: string; // "2026-05-27"
  dow: number; // 0=Dom, 1=Seg, ..., 6=Sab
} {
  // Em pt-BR: short weekday vem como "dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."
  // Usamos en-US pra ter "Sun"|"Mon"|... estavel:
  const dowLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(now);
  const dowMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dow = dowMap[dowLabel] ?? 0;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "2026-05-27"

  return { yyyymmdd: parts, dow };
}

/**
 * True se o item esta dentro da janela de programacao no momento atual (Brasilia).
 * Items sem nenhuma restricao de programacao retornam true.
 */
export function isScheduleActive(s: Schedule, now: Date = new Date()): boolean {
  const { yyyymmdd, dow } = getBrasiliaToday(now);

  if (s.schedule_start && s.schedule_start > yyyymmdd) return false;
  if (s.schedule_end && s.schedule_end < yyyymmdd) return false;
  if (s.schedule_off_days && s.schedule_off_days.includes(dow)) return false;

  return true;
}
