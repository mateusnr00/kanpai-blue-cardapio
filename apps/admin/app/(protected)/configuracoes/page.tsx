import { PageHeader } from "@/components/PageHeader";
import { getSiteSettings } from "@/lib/data/settings";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
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
