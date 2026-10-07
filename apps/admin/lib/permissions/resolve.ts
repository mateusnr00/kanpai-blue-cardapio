// ============================================================================
// RESOLVEDOR DE PERMISSÕES · Kanpai Blue  (função pura, 100% testável)
// ----------------------------------------------------------------------------
// Ordem de resolução (exatamente a definida):
//   1. DENY individual
//   2. ALLOW individual
//   3. permissão herdada do cargo
//   4. DEFAULT DENY
//
// Regras especiais:
//   • membership === null  → GRANDFATHER: acesso total.
//       Protege os admins atuais: enquanto o sistema não tiver sido semeado
//       (ninguém tem vínculo de equipe), todo usuário logado mantém acesso
//       integral. Assim o deploy do enforcement NUNCA tranca ninguém antes da
//       migração rodar. Depois de semeado, todo mundo tem membership.
//   • status "disabled"    → NEGA tudo, inclusive owner. Acesso suspenso.
//   • isOwner (ativo)      → PERMITE tudo. Cargo protegido.
// ============================================================================

export type PermissionEffect = "allow" | "deny";
export type StaffStatus = "active" | "disabled";

/** Vínculo da pessoa com a equipe. null = admin legado (sem sistema semeado). */
export type Membership = {
  status: StaffStatus;
  isOwner: boolean;
  /** Keys herdadas do cargo. */
  rolePermissions: readonly string[];
  /** Overrides individuais: key -> allow | deny. */
  overrides: Readonly<Record<string, PermissionEffect>>;
} | null;

/** De onde a permissão (concedida ou negada) veio — pra UI "de onde veio". */
export type PermissionSource =
  | "legacy" // admin legado, sem vínculo (grandfather)
  | "owner" // cargo proprietário
  | "disabled" // acesso suspenso
  | "override_allow" // permitido individualmente
  | "override_deny" // bloqueado individualmente
  | "role" // herdado do cargo
  | "default_deny"; // sem autorização

/** A pessoa pode acessar o painel? (desativado = não) */
export function isActive(m: Membership): boolean {
  return m === null || m.status === "active";
}

/** Resolve UMA permissão → tem acesso? */
export function can(key: string, m: Membership): boolean {
  // Admin legado: enquanto não houver sistema de equipe, acesso total.
  if (m === null) return true;
  // Suspenso: nega tudo.
  if (m.status === "disabled") return false;
  // Proprietário ativo: tudo.
  if (m.isOwner) return true;
  // 1. DENY individual
  if (m.overrides[key] === "deny") return false;
  // 2. ALLOW individual
  if (m.overrides[key] === "allow") return true;
  // 3. herdado do cargo
  if (m.rolePermissions.includes(key)) return true;
  // 4. DEFAULT DENY
  return false;
}

/** Explica a origem da decisão (pra interface). */
export function sourceOf(key: string, m: Membership): PermissionSource {
  if (m === null) return "legacy";
  if (m.status === "disabled") return "disabled";
  if (m.isOwner) return "owner";
  if (m.overrides[key] === "deny") return "override_deny";
  if (m.overrides[key] === "allow") return "override_allow";
  if (m.rolePermissions.includes(key)) return "role";
  return "default_deny";
}

/** Resolve várias keys de uma vez → mapa key -> boolean. */
export function resolveAll(keys: readonly string[], m: Membership): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const k of keys) out[k] = can(k, m);
  return out;
}
