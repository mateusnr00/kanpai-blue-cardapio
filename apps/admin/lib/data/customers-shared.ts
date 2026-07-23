// Tipos e helpers de clientes SEM dependência de servidor — seguros pra
// importar em componentes client (a query fica em customers.ts).

export type Customer = {
  key: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  /** Só dígitos, pra link de WhatsApp. */
  phoneDigits: string | null;
  visits: number;
  avgOverall: number | null;
  /** ISO da avaliação mais recente. */
  lastVisit: string;
  /** ISO da avaliação mais antiga. */
  firstVisit: string;
  lastComment: string | null;
};

/** Monta um número no formato do WhatsApp (assume Brasil quando sem DDI). */
export function whatsappNumber(phoneDigits: string | null): string | null {
  if (!phoneDigits) return null;
  const d = phoneDigits;
  if (d.startsWith("55") && d.length >= 12) return d; // já tem DDI
  if (d.length === 10 || d.length === 11) return `55${d}`; // DDD + número
  return d;
}
