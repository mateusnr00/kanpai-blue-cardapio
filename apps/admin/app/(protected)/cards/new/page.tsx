import { CategoryForm } from "@/components/CategoryForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { listParentCandidates } from "@/lib/data/categories";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { createCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const parents = await listParentCandidates(getActiveRestaurantId());
  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/cards">Voltar às categorias</BackLink>
      <PageHeader title="Nova categoria" description="Nome, slug, gradiente e foto da seção." />
      <div className="admin-card p-6 sm:p-8">
        <CategoryForm mode="create" parents={parents} onSubmit={createCategory} />
      </div>
    </section>
  );
}
