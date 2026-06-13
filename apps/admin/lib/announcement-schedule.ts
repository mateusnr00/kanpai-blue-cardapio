// ============================================================================
// Programação de avisos (reutilizável). Datas/horas no fuso de São Paulo.
// Espelhado em apps/site/lib/announcement-schedule.ts (mantenha iguais).
// ============================================================================

export type Schedule = {
  /** "YYYY-MM-DD" ou "YYYY-MM-DDTHH:MM" ou null. */
  start: string | null;
  end: string | null;
  /** Dias da semana em que NÃO aparece (0=Dom … 6=Sáb). */
  daysOff: number[];
};

export type AnnouncementStatus = "active" | "scheduled" | "expired" | "inactive";

const TZ = "America/Sao_Paulo";
// sv-SE formata como "YYYY-MM-DD HH:MM".
const SP_FMT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Agora no fuso de SP: { datetime: "YYYY-MM-DDTHH:MM", weekday: 0-6 }. */
export function spNow(now: Date = new Date()): { datetime: string; weekday: number } {
  const datetime = SP_FMT.format(now).replace(" ", "T").slice(0, 16);
  const ymd = datetime.slice(0, 10);
  // noon evita borda de dia; getDay = dia da semana daquela data civil.
  const weekday = new Date(`${ymd}T12:00:00`).getDay();
  return { datetime, weekday };
}

/** Normaliza a fronteira: data-só vira início (T00:00) ou fim (T23:59) do dia. */
function bound(value: string | null, isEnd: boolean): string | null {
  if (!value) return null;
  if (value.length <= 10) return `${value}T${isEnd ? "23:59" : "00:00"}`;
  return value.slice(0, 16);
}

/** Aparece hoje/agora? Vazio em tudo = sempre. */
export function isVisibleToday(schedule: Schedule, now: Date = new Date()): boolean {
  const { datetime, weekday } = spNow(now);
  if (schedule.daysOff?.includes(weekday)) return false;
  const start = bound(schedule.start, false);
  const end = bound(schedule.end, true);
  if (start && datetime < start) return false;
  if (end && datetime > end) return false;
  return true;
}

/** Status pro badge do admin. */
export function announcementStatus(
  isActive: boolean,
  schedule: Schedule,
  now: Date = new Date(),
): AnnouncementStatus {
  if (!isActive) return "inactive";
  const { datetime, weekday } = spNow(now);
  const end = bound(schedule.end, true);
  if (end && datetime > end) return "expired";
  const start = bound(schedule.start, false);
  if (start && datetime < start) return "scheduled";
  if (schedule.daysOff?.includes(weekday)) return "scheduled";
  return "active";
}

const DAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function fmtBound(v: string): string {
  const [y, m, d] = v.slice(0, 10).split("-");
  void y;
  const base = `${d}/${m}`;
  return v.length > 10 ? `${base} ${v.slice(11, 16)}` : base;
}

/** Resumo legível: "De 24/12 18:00 até 25/12 23:59 · não aparece seg". */
export function describeSchedule(schedule: Schedule): string {
  const parts: string[] = [];
  if (schedule.start && schedule.end) {
    parts.push(`De ${fmtBound(schedule.start)} até ${fmtBound(schedule.end)}`);
  } else if (schedule.start) {
    parts.push(`A partir de ${fmtBound(schedule.start)}`);
  } else if (schedule.end) {
    parts.push(`Até ${fmtBound(schedule.end)}`);
  }
  const off = (schedule.daysOff ?? []).filter((d) => d >= 0 && d <= 6);
  if (off.length > 0) {
    parts.push(`não aparece ${off.map((d) => DAY_SHORT[d]).join(", ")}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Aparece sempre";
}

export const STATUS_META: Record<
  AnnouncementStatus,
  { label: string; className: string }
> = {
  active: { label: "Ativo agora", className: "bg-green-100 text-green-700" },
  scheduled: { label: "Programado", className: "bg-blue-100 text-blue-700" },
  expired: { label: "Encerrado", className: "bg-ink-ghost text-ink-muted" },
  inactive: { label: "Inativo", className: "bg-amber-100 text-amber-700" },
};
