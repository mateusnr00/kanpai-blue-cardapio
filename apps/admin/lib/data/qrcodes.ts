import { createServerClient } from "@/lib/supabase-server";

export type QrCodeRow = {
  id: string;
  slug: string;
  label: string;
  target_path: string;
  created_at: string;
  /** visitas (sessoes distintas) que chegaram por este QR */
  visits: number;
  /** pessoas (visitantes distintos) que chegaram por este QR */
  people: number;
};

/**
 * Lista os QR codes da unidade + as metricas de cada um, lidas do
 * analytics_events (source = 'qr-<slug>'). Sem tabela de clicks separada:
 * conta sessoes e visitantes distintos atribuidos a cada QR.
 */
export async function listQrCodes(restaurantId: string): Promise<QrCodeRow[]> {
  const supabase = createServerClient();

  const { data: codes, error } = await supabase
    .from("qr_codes")
    .select("id, slug, label, target_path, created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const list = codes ?? [];
  if (list.length === 0) return [];

  const sources = list.map((c) => `qr-${c.slug}`);

  const { data: events, error: evErr } = await supabase
    .from("analytics_events")
    .select("source, visitor_id, session_id")
    .eq("restaurant_id", restaurantId)
    .in("source", sources);
  if (evErr) throw evErr;

  const agg = new Map<string, { sessions: Set<string>; people: Set<string> }>();
  for (const e of events ?? []) {
    if (!e.source) continue;
    const r = agg.get(e.source) ?? { sessions: new Set<string>(), people: new Set<string>() };
    r.sessions.add(e.session_id);
    r.people.add(e.visitor_id);
    agg.set(e.source, r);
  }

  return list.map((c) => {
    const r = agg.get(`qr-${c.slug}`);
    return {
      id: c.id,
      slug: c.slug,
      label: c.label,
      target_path: c.target_path,
      created_at: c.created_at,
      visits: r?.sessions.size ?? 0,
      people: r?.people.size ?? 0,
    };
  });
}
