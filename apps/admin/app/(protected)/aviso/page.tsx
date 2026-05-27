import { createServerClient } from "@/lib/supabase-server";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { PageHeader } from "@/components/PageHeader";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { saveAnnouncement } from "./actions";

export const dynamic = "force-dynamic";

async function load() {
  const restaurantId = getActiveRestaurantId();
  const supabase = createServerClient();
  const { data } = await supabase
    .from("restaurants")
    .select("announcement_active, announcement_image_path")
    .eq("id", restaurantId)
    .maybeSingle();
  const row = data as { announcement_active?: boolean; announcement_image_path?: string | null } | null;
  return {
    active: row?.announcement_active ?? false,
    imagePath: row?.announcement_image_path ?? null,
  };
}

export default async function AvisoPage() {
  const initial = await load();

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Aviso na home"
        description="Modal que aparece na home do restaurante ativo (1 vez por sessão). Use pra avisos pontuais — soft open, promo, mudança de horário."
      />
      <div className="admin-card p-6 sm:p-8">
        <AnnouncementForm
          initialActive={initial.active}
          initialImagePath={initial.imagePath}
          onSubmit={saveAnnouncement}
        />
      </div>
    </section>
  );
}
