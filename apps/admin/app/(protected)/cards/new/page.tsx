import { CategoryForm } from "@/components/CategoryForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/cards">Voltar às categorias</BackLink>
      <PageHeader title="Nova categoria" description="Nome, slug, gradiente e foto da seção." />
      <div className="admin-card p-6 sm:p-8">
        <CategoryForm mode="create" onSubmit={createCategory} />
      </div>
    </section>
  );
}
