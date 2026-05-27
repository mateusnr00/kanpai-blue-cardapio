import { createServerClient } from "./supabase-server";

export type AuditAction = "create" | "update" | "delete" | "reorder" | "toggle";

export type AuditEntity =
  | "dish"
  | "category"
  | "linktree_button"
  | "linktree_theme"
  | "review"
  | "restaurant"
  | "user";

export type AuditParams = {
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string | null;
  entityLabel?: string | null;
  restaurantId?: string | null;
  details?: Record<string, unknown> | null;
};

/**
 * Grava uma linha no historico de admin. Fire-and-forget — nunca quebra a
 * Server Action que chamou. Pega o usuario logado via cookies do Supabase.
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      entity_label: params.entityLabel ?? null,
      restaurant_id: params.restaurantId ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details: (params.details ?? null) as any,
    });
  } catch (err) {
    console.warn("[logAudit] falhou:", (err as Error).message);
  }
}
