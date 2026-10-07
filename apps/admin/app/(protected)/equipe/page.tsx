import { PageHeader } from "@/components/PageHeader";
import { AccessDenied } from "@/components/AccessDenied";
import { hasPermission } from "@/lib/permissions/server";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { ensureRolesSeeded } from "@/lib/permissions/sync";
import { listStaff, listRoles } from "@/lib/data/staff";
import { StaffList } from "./StaffList";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  if (!(await hasPermission(PERMISSIONS.STAFF_VIEW))) {
    return <AccessDenied />;
  }
  await ensureRolesSeeded();

  const [staff, roles, canInvite] = await Promise.all([
    listStaff(),
    listRoles(),
    hasPermission(PERMISSIONS.STAFF_INVITE),
  ]);

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Equipe"
        description="Gerencie quem pode acessar e modificar o Kanpai."
      />
      <StaffList staff={staff} roles={roles} canInvite={canInvite} />
    </section>
  );
}
