import { notFound } from "next/navigation";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { getExecutivo, listExecutivoItems } from "@/lib/data/executivos";
import { ExecutivoForm } from "@/components/ExecutivoForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { updateExecutivo } from "../actions";

type Params = { id: string };

export default async function EditExecutivoPage({ params }: { params: Params }) {
  const [categories, executivo] = await Promise.all([
    listCategoriesWithCounts(),
    getExecutivo(params.id),
  ]);

  if (!executivo) notFound();
  const items = await listExecutivoItems(executivo.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return updateExecutivo(params.id, formData);
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/executivos">Voltar aos executivos</BackLink>
      <PageHeader title={`Editar: ${executivo.name}`} description="Dados do menu e itens por etapa." />
      <div className="admin-card p-6 sm:p-8">
        <ExecutivoForm
          mode="edit"
          initial={executivo}
          items={items}
          categories={categories}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}
