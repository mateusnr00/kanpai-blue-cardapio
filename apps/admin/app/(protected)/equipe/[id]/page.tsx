import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { AccessDenied } from "@/components/AccessDenied";
import { hasPermission, getCurrentUser } from "@/lib/permissions/server";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getStaffMember, listRoles } from "@/lib/data/staff";
import { StaffDetail } from "./StaffDetail";

export const dynamic = "force-dynamic";

export default async function StaffDetailPage({ params }: { params: { id: string } }) {
  if (!(await hasPermission(PERMISSIONS.STAFF_VIEW))) {
    return <AccessDenied />;
  }

  const [member, roles, me, canRole, canPerm, canDisable, canRemove] = await Promise.all([
    getStaffMember(params.id),
    listRoles(),
    getCurrentUser(),
    hasPermission(PERMISSIONS.STAFF_ROLE_UPDATE),
    hasPermission(PERMISSIONS.STAFF_PERMISSION_UPDATE),
    hasPermission(PERMISSIONS.STAFF_DISABLE),
    hasPermission(PERMISSIONS.STAFF_REMOVE),
  ]);

  if (!member) notFound();

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6">
      <BackLink href="/equipe">Voltar à equipe</BackLink>
      <StaffDetail
        member={member}
        roles={roles}
        isSelf={me?.id === member.userId}
        perms={{ role: canRole, permission: canPerm, disable: canDisable, remove: canRemove }}
      />
    </section>
  );
}
