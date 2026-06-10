import { CategoryForm } from "@/components/CategoryForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { listParentCandidates } from "@/lib/data/categories";
import { getActiveRestaurantId, listRestaurants } from "@/lib/active-restaurant";
import { createCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const restaurantId = getActiveRestaurantId();
  const [parents, restaurants] = await Promise.all([
    listParentCandidates(restaurantId),
    listRestaurants(),
  ]);
  const otherUnits = restaurants
    .filter((r) => r.active && r.id !== restaurantId)
    .map((r) => ({ id: r.id, shortName: r.short_name }));
  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/cards">Voltar às categorias</BackLink>
      <PageHeader title="Nova categoria" description="Nome, slug, gradiente e foto da seção." />
      <div className="admin-card p-6 sm:p-8">
        <CategoryForm mode="create" parents={parents} otherUnits={otherUnits} onSubmit={createCategory} />
      </div>
    </section>
  );
}
