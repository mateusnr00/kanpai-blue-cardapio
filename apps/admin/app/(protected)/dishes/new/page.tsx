import { listCategoriesWithCounts } from "@/lib/data/categories";
import { DishForm } from "@/components/DishForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { createDish } from "../actions";

export default async function NewDishPage({ searchParams }: { searchParams: { cat?: string } }) {
  const categories = await listCategoriesWithCounts();

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/">Voltar ao cardápio</BackLink>
      <PageHeader title="Novo item" description="Adicione um prato ou item ao cardápio." />
      <div className="admin-card p-6 sm:p-8">
        <DishForm
          mode="create"
          categories={categories}
          defaultCategoryId={searchParams.cat}
          onSubmit={createDish}
        />
      </div>
    </section>
  );
}
