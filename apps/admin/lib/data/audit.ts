import { createServerClient } from "@/lib/supabase-server";

export type AuditRow = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  restaurant_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function listAuditLog(opts: {
  limit?: number;
  restaurantId?: string | null;
  entityType?: string | null;
  action?: string | null;
}): Promise<AuditRow[]> {
  const supabase = createServerClient();
  let q = supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.restaurantId) q = q.eq("restaurant_id", opts.restaurantId);
  if (opts.entityType) q = q.eq("entity_type", opts.entityType);
  if (opts.action) q = q.eq("action", opts.action);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AuditRow[];
}
