import { notFound } from "next/navigation";
import { getCategory } from "@/lib/data/categories";
import { CategoryForm } from "@/components/CategoryForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { updateCategory } from "../actions";

type Params = { id: string };

export default async function EditCategoryPage({ params }: { params: Params }) {
  const category = await getCategory(params.id);
  if (!category) notFound();

  async function onSubmit(formData: FormData) {
    "use server";
    return updateCategory(params.id, formData);
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/cards">Voltar às categorias</BackLink>
      <PageHeader title={`Editar: ${category.name}`} description="Ajuste aparência e subcategorias da seção." />
      <div className="admin-card p-6 sm:p-8">
        <CategoryForm mode="edit" initial={category} onSubmit={onSubmit} />
      </div>
    </section>
  );
}
