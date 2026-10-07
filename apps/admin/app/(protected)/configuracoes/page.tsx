import { PageHeader } from "@/components/PageHeader";
import { AccessDenied } from "@/components/AccessDenied";
import { hasPermission } from "@/lib/permissions/server";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getSiteSettings } from "@/lib/data/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  if (!(await hasPermission(PERMISSIONS.INTEGRATIONS_UPDATE))) return <AccessDenied />;
  const settings = await getSiteSettings();

  return (
    <section className="flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Pixels e ferramentas de analytics do site público."
      />
      <SettingsForm initial={settings} />
    </section>
  );
}
