/**
 * Helper compartilhado: extrai os campos do ScheduleEditor de um FormData.
 * Retorna shape pra spread no insert/update do Supabase.
 */

export type ScheduleColumns = {
  schedule_start: string | null;
  schedule_end: string | null;
  schedule_off_days: number[];
};

export function parseScheduleFromForm(formData: FormData, prefix = "schedule"): ScheduleColumns {
  const startRaw = String(formData.get(`${prefix}_start`) ?? "").trim();
  const endRaw = String(formData.get(`${prefix}_end`) ?? "").trim();
  const offRaw = String(formData.get(`${prefix}_off_days`) ?? "").trim();

  // ATENCAO: filtrar string vazia ANTES de Number() — Number("") === 0,
  // o que passaria no .filter() abaixo e injetaria Domingo (0) em toda
  // categoria/prato sem programacao. Bug ja causou hide de itens no Dom.
  const off = offRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

  return {
    schedule_start: startRaw || null,
    schedule_end: endRaw || null,
    schedule_off_days: off,
  };
}
