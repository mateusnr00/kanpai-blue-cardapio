"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";
import { logAudit } from "@/lib/audit";
import { ensure, getCurrentUser, getCurrentMembership } from "@/lib/permissions/server";
import { ensureRolesSeeded } from "@/lib/permissions/sync";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { isValidPermission } from "@/lib/permissions/catalog";

type Result = { error?: string; ok?: true };

async function actorIsOwner(): Promise<boolean> {
  const m = await getCurrentMembership();
  return !!m && m.isOwner && m.status === "active";
}

type TargetRow = { user_id: string; role_slug: string; is_owner: boolean; status: string } | null;

async function loadTarget(userId: string): Promise<TargetRow> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_members")
    .select("user_id, role_slug, is_owner, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

async function countActiveOwners(): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("staff_members")
    .select("user_id", { count: "exact", head: true })
    .eq("is_owner", true)
    .eq("status", "active");
  return count ?? 0;
}

// ============================================================================
// Convidar / adicionar
// ============================================================================
export async function inviteStaff(input: {
  email: string;
  password: string;
  roleSlug: string;
}): Promise<Result> {
  const gate = await ensure(PERMISSIONS.STAFF_INVITE);
  if (gate) return gate;
  await ensureRolesSeeded();

  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!email.includes("@")) return { error: "Email inválido." };
  if (password.length < 8) return { error: "Senha precisa ter ao menos 8 caracteres." };

  const admin = createAdminClient();
  const { data: role } = await admin.from("roles").select("slug, is_owner").eq("slug", input.roleSlug).maybeSingle();
  if (!role) return { error: "Cargo inválido." };
  // Só owner pode criar outro owner.
  if (role.is_owner && !(await actorIsOwner())) {
    return { error: "Apenas o proprietário pode conceder o cargo de proprietário." };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created?.user) return { error: createErr?.message ?? "Falha ao criar usuário." };

  const { error: memberErr } = await admin.from("staff_members").insert({
    user_id: created.user.id,
    role_slug: role.slug,
    status: "active",
    is_owner: !!role.is_owner,
    name: email,
  });
  if (memberErr) return { error: memberErr.message };

  await logAudit({
    action: "create",
    entityType: "staff",
    entityId: created.user.id,
    entityLabel: email,
    details: { role: role.slug },
  });
  revalidatePath("/equipe");
  return { ok: true };
}

// ============================================================================
// Trocar cargo
// ============================================================================
export async function updateStaffRole(userId: string, roleSlug: string): Promise<Result> {
  const gate = await ensure(PERMISSIONS.STAFF_ROLE_UPDATE);
  if (gate) return gate;

  const me = await getCurrentUser();
  if (me?.id === userId) return { error: "Você não pode alterar o próprio cargo." };

  const target = await loadTarget(userId);
  if (!target) return { error: "Funcionário não encontrado." };

  const admin = createAdminClient();
  const { data: role } = await admin.from("roles").select("slug, is_owner").eq("slug", roleSlug).maybeSingle();
  if (!role) return { error: "Cargo inválido." };

  const iAmOwner = await actorIsOwner();
  // Mexer num owner, ou tornar alguém owner, exige ser owner.
  if ((target.is_owner || role.is_owner) && !iAmOwner) {
    return { error: "Apenas o proprietário pode alterar cargos de proprietário." };
  }
  // Não rebaixar o último owner ativo.
  if (target.is_owner && !role.is_owner && (await countActiveOwners()) <= 1) {
    return { error: "Não é possível rebaixar o único proprietário." };
  }

  const { error } = await admin
    .from("staff_members")
    .update({ role_slug: role.slug, is_owner: !!role.is_owner })
    .eq("user_id", userId);
  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    entityType: "staff",
    entityId: userId,
    details: { from_role: target.role_slug, to_role: role.slug },
  });
  revalidatePath("/equipe");
  revalidatePath(`/equipe/${userId}`);
  return { ok: true };
}

// ============================================================================
// Override individual (allow / deny / voltar ao padrão do cargo)
// ============================================================================
export async function setStaffOverride(
  userId: string,
  permissionKey: string,
  effect: "allow" | "deny" | null,
): Promise<Result> {
  const gate = await ensure(PERMISSIONS.STAFF_PERMISSION_UPDATE);
  if (gate) return gate;

  const me = await getCurrentUser();
  if (me?.id === userId) return { error: "Você não pode alterar as próprias permissões." };
  if (!isValidPermission(permissionKey)) return { error: "Permissão inválida." };

  const target = await loadTarget(userId);
  if (!target) return { error: "Funcionário não encontrado." };
  if (target.is_owner) return { error: "O proprietário tem acesso total; não é personalizável." };

  const admin = createAdminClient();
  if (effect === null) {
    const { error } = await admin
      .from("staff_permission_overrides")
      .delete()
      .eq("user_id", userId)
      .eq("permission_key", permissionKey);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin
      .from("staff_permission_overrides")
      .upsert({ user_id: userId, permission_key: permissionKey, effect }, { onConflict: "user_id,permission_key" });
    if (error) return { error: error.message };
  }

  await logAudit({
    action: "update",
    entityType: "permission",
    entityId: userId,
    details: { permission: permissionKey, effect: effect ?? "role_default" },
  });
  revalidatePath(`/equipe/${userId}`);
  return { ok: true };
}

// ============================================================================
// Desativar / reativar acesso
// ============================================================================
export async function setStaffStatus(userId: string, active: boolean): Promise<Result> {
  const gate = await ensure(PERMISSIONS.STAFF_DISABLE);
  if (gate) return gate;

  const me = await getCurrentUser();
  if (me?.id === userId) return { error: "Você não pode desativar o próprio acesso." };

  const target = await loadTarget(userId);
  if (!target) return { error: "Funcionário não encontrado." };
  if (target.is_owner && !(await actorIsOwner())) {
    return { error: "Apenas o proprietário pode desativar um proprietário." };
  }
  if (target.is_owner && !active && (await countActiveOwners()) <= 1) {
    return { error: "Não é possível desativar o único proprietário." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("staff_members")
    .update({ status: active ? "active" : "disabled", disabled_at: active ? null : new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { error: error.message };

  await logAudit({
    action: active ? "update" : "toggle",
    entityType: "staff",
    entityId: userId,
    details: { status: active ? "active" : "disabled" },
  });
  revalidatePath("/equipe");
  revalidatePath(`/equipe/${userId}`);
  return { ok: true };
}

// ============================================================================
// Remover funcionário (revoga acesso de vez: apaga vínculo + conta de auth)
// ============================================================================
export async function removeStaff(userId: string): Promise<Result> {
  const gate = await ensure(PERMISSIONS.STAFF_REMOVE);
  if (gate) return gate;

  const me = await getCurrentUser();
  if (me?.id === userId) return { error: "Você não pode remover a si mesmo." };

  const target = await loadTarget(userId);
  if (!target) return { error: "Funcionário não encontrado." };
  if (target.is_owner && !(await actorIsOwner())) {
    return { error: "Apenas o proprietário pode remover um proprietário." };
  }
  if (target.is_owner && (await countActiveOwners()) <= 1) {
    return { error: "Não é possível remover o único proprietário." };
  }

  const admin = createAdminClient();
  // staff_members cai por cascade ao apagar o auth user; mas apagamos explicitamente antes.
  await admin.from("staff_members").delete().eq("user_id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await logAudit({ action: "delete", entityType: "staff", entityId: userId });
  revalidatePath("/equipe");
  return { ok: true };
}
