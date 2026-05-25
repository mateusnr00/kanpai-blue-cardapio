import { listCategoriesWithCounts } from "@/lib/data/categories";
import { ExecutivoForm } from "@/components/ExecutivoForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { createExecutivo } from "../actions";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

export default async function NewExecutivoPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const restaurantId = getActiveRestaurantId();
  const categories = await listCategoriesWithCounts(restaurantId);

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href={searchParams.cat ? `/?cat=${searchParams.cat}` : "/executivos"}>
        {searchParams.cat ? "Voltar ao cardápio" : "Voltar aos executivos"}
      </BackLink>
      <PageHeader title="Novo executivo" description="Menu executivo com entradas, principais e sobremesas." />
      <div className="admin-card p-6 sm:p-8">
        <ExecutivoForm
          mode="create"
          categories={categories}
          defaultCategoryId={searchParams.cat}
          onSubmit={createExecutivo}
        />
      </div>
    </section>
  );
}
