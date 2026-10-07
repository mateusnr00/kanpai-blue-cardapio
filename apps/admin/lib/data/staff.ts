import "server-only";
import { createAdminClient } from "@/lib/supabase-admin";
import { can, type Membership, type PermissionEffect } from "@/lib/permissions/resolve";
import { PERMISSION_MODULES } from "@/lib/permissions/catalog";

export type StaffStatus = "active" | "disabled";

export type StaffListItem = {
  userId: string;
  email: string | null;
  name: string | null;
  roleSlug: string;
  roleName: string;
  status: StaffStatus;
  isOwner: boolean;
  /** Módulos em que a pessoa tem algum acesso (pra o resumo do card). */
  moduleLabels: string[];
};

export type StaffDetail = {
  userId: string;
  email: string | null;
  name: string | null;
  roleSlug: string;
  roleName: string;
  status: StaffStatus;
  isOwner: boolean;
  createdAt: string;
  rolePermissions: string[];
  overrides: Record<string, PermissionEffect>;
};

export type RoleOption = { slug: string; name: string; description: string; isOwner: boolean };

function membershipOf(
  status: StaffStatus,
  isOwner: boolean,
  rolePermissions: string[],
  overrides: Record<string, PermissionEffect>,
): Membership {
  return { status, isOwner, rolePermissions, overrides };
}

/** Módulos com ao menos uma permissão concedida. Owner → todos. */
function moduleLabelsFor(m: Membership): string[] {
  return PERMISSION_MODULES.filter((mod) =>
    mod.permissions.some((p) => can(p.key, m)),
  ).map((mod) => mod.label);
}

export async function listRoles(): Promise<RoleOption[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("roles").select("slug, name, description, is_owner").order("is_owner", { ascending: false }).order("name");
    return (data ?? []).map((r) => ({ slug: r.slug, name: r.name, description: r.description, isOwner: r.is_owner }));
  } catch {
    return [];
  }
}

export async function listStaff(): Promise<StaffListItem[]> {
  const admin = createAdminClient();

  const [usersRes, membersRes, rolesRes, rolePermsRes, overridesRes] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    admin.from("staff_members").select("user_id, role_slug, status, is_owner, name"),
    admin.from("roles").select("slug, name"),
    admin.from("role_permissions").select("role_slug, permission_key"),
    admin.from("staff_permission_overrides").select("user_id, permission_key, effect"),
  ]);

  const emailById = new Map<string, string | null>();
  for (const u of usersRes.data?.users ?? []) emailById.set(u.id, u.email ?? null);

  const roleName = new Map<string, string>();
  for (const r of rolesRes.data ?? []) roleName.set(r.slug, r.name);

  const permsByRole = new Map<string, string[]>();
  for (const rp of rolePermsRes.data ?? []) {
    const arr = permsByRole.get(rp.role_slug) ?? [];
    arr.push(rp.permission_key);
    permsByRole.set(rp.role_slug, arr);
  }

  const overridesByUser = new Map<string, Record<string, PermissionEffect>>();
  for (const o of overridesRes.data ?? []) {
    if (o.effect !== "allow" && o.effect !== "deny") continue;
    const m = overridesByUser.get(o.user_id) ?? {};
    m[o.permission_key] = o.effect;
    overridesByUser.set(o.user_id, m);
  }

  return (membersRes.data ?? [])
    .map((member) => {
      const status: StaffStatus = member.status === "disabled" ? "disabled" : "active";
      const m = membershipOf(
        status,
        !!member.is_owner,
        permsByRole.get(member.role_slug) ?? [],
        overridesByUser.get(member.user_id) ?? {},
      );
      return {
        userId: member.user_id,
        email: emailById.get(member.user_id) ?? null,
        name: member.name,
        roleSlug: member.role_slug,
        roleName: roleName.get(member.role_slug) ?? member.role_slug,
        status,
        isOwner: !!member.is_owner,
        moduleLabels: member.is_owner ? ["Acesso total"] : moduleLabelsFor(m),
      };
    })
    .sort((a, b) => {
      if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
      return (a.email ?? "").localeCompare(b.email ?? "");
    });
}

export async function getStaffMember(userId: string): Promise<StaffDetail | null> {
  const admin = createAdminClient();

  const { data: member } = await admin
    .from("staff_members")
    .select("user_id, role_slug, status, is_owner, name, created_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!member) return null;

  const [userRes, roleRes, rolePermsRes, overridesRes] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("roles").select("name").eq("slug", member.role_slug).maybeSingle(),
    admin.from("role_permissions").select("permission_key").eq("role_slug", member.role_slug),
    admin.from("staff_permission_overrides").select("permission_key, effect").eq("user_id", userId),
  ]);

  const overrides: Record<string, PermissionEffect> = {};
  for (const o of overridesRes.data ?? []) {
    if (o.effect === "allow" || o.effect === "deny") overrides[o.permission_key] = o.effect;
  }

  return {
    userId: member.user_id,
    email: userRes.data?.user?.email ?? null,
    name: member.name,
    roleSlug: member.role_slug,
    roleName: roleRes.data?.name ?? member.role_slug,
    status: member.status === "disabled" ? "disabled" : "active",
    isOwner: !!member.is_owner,
    createdAt: member.created_at,
    rolePermissions: (rolePermsRes.data ?? []).map((r) => r.permission_key),
    overrides,
  };
}
