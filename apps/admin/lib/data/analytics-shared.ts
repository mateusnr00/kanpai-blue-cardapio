// Tipos e constantes compartilhados entre server e client.
// (Sem imports de "next/headers" pra poder ser usado em componentes client.)

export type Range = "today" | "yesterday" | "7d" | "30d" | "90d" | "all";

export const RANGE_LABELS: Record<Range, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  all: "Tudo",
};

export const RANGE_ORDER: Range[] = ["today", "yesterday", "7d", "30d", "90d", "all"];
