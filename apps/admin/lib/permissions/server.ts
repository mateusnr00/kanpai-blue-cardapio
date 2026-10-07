import "server-only";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { can as resolveCan, sourceOf, isActive, type Membership, type PermissionEffect, type PermissionSource } from "./resolve";
import { ALL_PERMISSION_KEYS, type PermissionKey } from "./catalog";
import { ForbiddenError, deniedMessage } from "./errors";

export type CurrentUser = { id: string; email: string | null } | null;

/** Usuário logado (via sessão). Cacheado por request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
});

/**
 * O sistema de equipe já foi semeado? (existe ao menos 1 vínculo).
 * Enquanto NÃO estiver semeado, usuários sem vínculo recebem acesso total
 * (grandfather). Depois de semeado, um usuário sem vínculo recebe default-deny
 * — assim remover alguém revoga de fato, em vez de cair no grandfather.
 */
export const isAccessControlInitialized = cache(async (): Promise<boolean> => {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("staff_members")
      .select("user_id", { count: "exact", head: true });
    if (error) return false; // tabela não existe → não inicializado
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
});

/** Membership vazia (sistema inicializado, mas pessoa sem vínculo) → default-deny. */
const NO_ACCESS: Membership = {
  status: "active",
  isOwner: false,
  rolePermissions: [],
  overrides: {},
};

/**
 * Vínculo de equipe do usuário atual. Cacheado por request.
 * Fallback seguro: se as tabelas ainda não existem (migration não aplicada) ou
 * o usuário não tem vínculo, retorna null → o resolvedor concede acesso total
 * (grandfather). Assim o deploy nunca tranca ninguém antes da migração.
 */
export const getCurrentMembership = cache(async (): Promise<Membership> => {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const admin = createAdminClient();
    const { data: member, error } = await admin
      .from("staff_members")
      .select("status, is_owner, role_slug")
      .eq("user_id", user.id)
      .maybeSingle();

    // Tabela inexistente / erro → grandfather.
    if (error) return null;
    // Sem vínculo: grandfather só enquanto o sistema não foi semeado.
    if (!member) {
      const initialized = await isAccessControlInitialized();
      return initialized ? NO_ACCESS : null;
    }

    const [{ data: rolePerms }, { data: overrides }] = await Promise.all([
      admin.from("role_permissions").select("permission_key").eq("role_slug", member.role_slug),
      admin.from("staff_permission_overrides").select("permission_key, effect").eq("user_id", user.id),
    ]);

    const overrideMap: Record<string, PermissionEffect> = {};
    for (const o of overrides ?? []) {
      if (o.effect === "allow" || o.effect === "deny") overrideMap[o.permission_key] = o.effect;
    }

    return {
      status: member.status === "disabled" ? "disabled" : "active",
      isOwner: !!member.is_owner,
      rolePermissions: (rolePerms ?? []).map((r) => r.permission_key),
      overrides: overrideMap,
    };
  } catch {
    // Qualquer falha de infra → não derruba o painel; grandfather.
    return null;
  }
});

/** O usuário atual tem a permissão? */
export async function hasPermission(key: PermissionKey): Promise<boolean> {
  const m = await getCurrentMembership();
  return resolveCan(key, m);
}

/** O usuário atual está ativo (não suspenso)? */
export async function currentUserActive(): Promise<boolean> {
  const m = await getCurrentMembership();
  return isActive(m);
}

/**
 * Para Server Actions (padrão { error? }): retorna { error } se negado, ou null
 * se permitido. Também nega se o usuário estiver suspenso.
 */
export async function ensure(key: PermissionKey): Promise<{ error: string } | null> {
  const m = await getCurrentMembership();
  if (!isActive(m)) return { error: "Seu acesso foi suspenso." };
  if (!resolveCan(key, m)) return { error: deniedMessage() };
  return null;
}

/** Para route guards / pages: lança ForbiddenError se negado. */
export async function requirePermission(key: PermissionKey): Promise<void> {
  const ok = await hasPermission(key);
  if (!ok) throw new ForbiddenError(key);
}

/** Mapa completo de permissões efetivas + metadados — pro editor de permissões. */
export async function getEffectivePermissions(): Promise<{
  can: Record<string, boolean>;
  source: Record<string, PermissionSource>;
  membership: Membership;
}> {
  const m = await getCurrentMembership();
  const can: Record<string, boolean> = {};
  const source: Record<string, PermissionSource> = {};
  for (const k of ALL_PERMISSION_KEYS) {
    can[k] = resolveCan(k, m);
    source[k] = sourceOf(k, m);
  }
  return { can, source, membership: m };
}

/** Resolve permissões de um usuário específico (pro admin editar outra pessoa). */
export function resolveFor(key: PermissionKey, m: Membership): boolean {
  return resolveCan(key, m);
}
