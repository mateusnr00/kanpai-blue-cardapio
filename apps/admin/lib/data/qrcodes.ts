import { createServerClient } from "@/lib/supabase-server";

export type QrCodeRow = {
  id: string;
  slug: string;
  label: string;
  target_path: string;
  created_at: string;
  /** leituras (scans) registradas pra este QR */
  scans: number;
};

/**
 * Lista os QR codes da unidade + quantas leituras cada um teve.
 * As leituras saem do analytics_events (event_type='qr_scan', source='qr-<slug>'),
 * registradas pela rota /q. Sem tabela de clicks separada.
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
    .select("source")
    .eq("event_type", "qr_scan")
    .in("source", sources);
  if (evErr) throw evErr;

  const counts = new Map<string, number>();
  for (const e of events ?? []) {
    if (!e.source) continue;
    counts.set(e.source, (counts.get(e.source) ?? 0) + 1);
  }

  return list.map((c) => ({
    id: c.id,
    slug: c.slug,
    label: c.label,
    target_path: c.target_path,
    created_at: c.created_at,
    scans: counts.get(`qr-${c.slug}`) ?? 0,
  }));
}
