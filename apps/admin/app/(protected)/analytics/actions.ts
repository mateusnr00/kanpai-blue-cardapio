"use server";

import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { loadHourHistogram } from "@/lib/data/analytics";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Histograma de acessos por hora de um dia específico (YYYY-MM-DD, fuso de
 * Brasília). Usado pelo gráfico "Horário do dia" ao navegar entre dias.
 */
export async function fetchHourHistogram(
  day: string,
  categorySlug?: string | null
): Promise<number[]> {
  if (!DAY_RE.test(day)) {
    throw new Error("Data inválida");
  }
  const restaurantId = getActiveRestaurantId();
  return loadHourHistogram(restaurantId, day, categorySlug ?? undefined);
}
