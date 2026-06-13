import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { AnnouncementForm } from "@/components/AnnouncementForm";
import { createAnnouncement } from "../actions";

export const dynamic = "force-dynamic";

export default function NewAnnouncementPage() {
  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/aviso">Voltar aos avisos</BackLink>
      <PageHeader title="Novo aviso" description="Imagem, proporção, escurecimento e programação." />
      <div className="admin-card p-6 sm:p-8">
        <AnnouncementForm onSubmit={createAnnouncement} />
      </div>
    </section>
  );
}
