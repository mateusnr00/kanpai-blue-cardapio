import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { getAnnouncement } from "@/lib/data/announcements";
import { updateAnnouncement } from "../actions";

export const dynamic = "force-dynamic";

const BUCKET_MARKER = "/storage/v1/object/public/dish-images/";
function urlToPath(url: string | null): string | null {
  if (!url) return null;
  const i = url.indexOf(BUCKET_MARKER);
  return i >= 0 ? url.slice(i + BUCKET_MARKER.length) : null;
}

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const a = await getAnnouncement(params.id);
  if (!a) notFound();

  async function onSubmit(formData: FormData) {
    "use server";
    return updateAnnouncement(params.id, formData);
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/aviso">Voltar aos avisos</BackLink>
      <PageHeader title={`Editar: ${a.name}`} description="Imagem, proporção, escurecimento e programação." />
      <div className="admin-card p-6 sm:p-8">
        <AnnouncementForm initial={a} initialImagePath={urlToPath(a.image_url)} onSubmit={onSubmit} />
      </div>
    </section>
  );
}
