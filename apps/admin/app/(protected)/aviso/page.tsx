import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { listAnnouncements } from "@/lib/data/announcements";
import { PageHeader } from "@/components/PageHeader";
import { AnnouncementsList } from "@/components/AnnouncementsList";

export const dynamic = "force-dynamic";

export default async function AvisoPage() {
  const items = await listAnnouncements(getActiveRestaurantId());

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Avisos"
        description="Modais que aparecem na home do restaurante ativo. Programe vários (Natal, Ano Novo…) e eles entram/saem sozinhos. Cada um aparece 1x por sessão."
      />
      <AnnouncementsList initial={items} />
    </section>
  );
}
