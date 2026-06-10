import { listCategoriesWithCounts } from "@/lib/data/categories";
import { listAvailableComponentChoices } from "@/lib/data/dishes";
import { DishForm } from "@/components/DishForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { createDish } from "../actions";
import { getActiveRestaurantId, listRestaurants } from "@/lib/active-restaurant";

export default async function NewDishPage({ searchParams }: { searchParams: { cat?: string } }) {
  const restaurantId = getActiveRestaurantId();
  const [categories, componentChoices, restaurants] = await Promise.all([
    listCategoriesWithCounts(restaurantId),
    // sem prato pra excluir (id ainda não existe), passa string vazia — não impacta filtro
    listAvailableComponentChoices(restaurantId, ""),
    listRestaurants(),
  ]);
  const otherUnits = restaurants
    .filter((r) => r.active && r.id !== restaurantId)
    .map((r) => ({ id: r.id, shortName: r.short_name }));

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/">Voltar ao cardápio</BackLink>
      <PageHeader title="Novo item" description="Adicione um prato ou item ao cardápio." />
      <div className="admin-card p-6 sm:p-8">
        <DishForm
          mode="create"
          categories={categories}
          defaultCategoryId={searchParams.cat}
          componentChoices={componentChoices}
          otherUnits={otherUnits}
          onSubmit={createDish}
        />
      </div>
    </section>
  );
}
