import { createServerClient } from "@/lib/supabase-server";
import type { Customer } from "./customers-shared";

// ============================================================================
// Base de clientes ("CRM") derivada das avaliações.
// ----------------------------------------------------------------------------
// Cada cliente = agrupamento das avaliações que deixaram contato, unificadas
// por telefone (dígitos) → e-mail → nome. A mesma pessoa que avaliou várias
// vezes vira um único cliente, com contagem de visitas e nota média.
// ============================================================================

export type { Customer } from "./customers-shared";
export { whatsappNumber } from "./customers-shared";

function digitsOnly(s: string | null | undefined): string | null {
  if (!s) return null;
  const d = s.replace(/\D+/g, "");
  return d.length ? d : null;
}

type ReviewContactRow = {
  overall: number | null;
  comment: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
};

export async function listCustomers(restaurantId: string): Promise<Customer[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("overall, comment, contact_name, contact_email, contact_phone, created_at")
    .eq("restaurant_id", restaurantId)
    .or("contact_name.not.is.null,contact_email.not.is.null,contact_phone.not.is.null")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;

  const rows = (data ?? []) as ReviewContactRow[];

  type Agg = Customer & { overallSum: number; overallCount: number };
  const map = new Map<string, Agg>();

  // Vem ordenado do mais recente pro mais antigo: o primeiro visto de cada
  // chave é o dado de contato mais atual.
  for (const r of rows) {
    const phoneDigits = digitsOnly(r.contact_phone);
    const email = r.contact_email?.trim().toLowerCase() || null;
    const name = r.contact_name?.trim() || null;
    const key = phoneDigits
      ? `p:${phoneDigits}`
      : email
        ? `e:${email}`
        : name
          ? `n:${name.toLowerCase()}`
          : null;
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        name,
        email,
        phone: r.contact_phone?.trim() || null,
        phoneDigits,
        visits: 1,
        avgOverall: null,
        lastVisit: r.created_at,
        firstVisit: r.created_at,
        lastComment: r.comment?.trim() || null,
        overallSum: r.overall ?? 0,
        overallCount: r.overall != null ? 1 : 0,
      });
    } else {
      existing.visits += 1;
      if (r.overall != null) {
        existing.overallSum += r.overall;
        existing.overallCount += 1;
      }
      // Preenche campos que faltarem com dados de avaliações anteriores.
      if (!existing.name && name) existing.name = name;
      if (!existing.email && email) existing.email = email;
      if (!existing.phone && r.contact_phone) existing.phone = r.contact_phone.trim();
      if (!existing.phoneDigits && phoneDigits) existing.phoneDigits = phoneDigits;
      if (!existing.lastComment && r.comment?.trim()) existing.lastComment = r.comment.trim();
      // created_at desc → esse é sempre <= lastVisit; vira o firstVisit corrente.
      existing.firstVisit = r.created_at;
    }
  }

  return Array.from(map.values())
    .map((a) => ({
      key: a.key,
      name: a.name,
      email: a.email,
      phone: a.phone,
      phoneDigits: a.phoneDigits,
      visits: a.visits,
      avgOverall: a.overallCount ? a.overallSum / a.overallCount : null,
      lastVisit: a.lastVisit,
      firstVisit: a.firstVisit,
      lastComment: a.lastComment,
    }))
    .sort((x, y) => y.lastVisit.localeCompare(x.lastVisit));
}
