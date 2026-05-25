import { notFound } from "next/navigation";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { getDish, listVariants } from "@/lib/data/dishes";
import { DishForm } from "@/components/DishForm";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { updateDish } from "../actions";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

type Params = { id: string };

export default async function EditDishPage({ params }: { params: Params }) {
  const restaurantId = getActiveRestaurantId();
  const [categories, dish] = await Promise.all([
    listCategoriesWithCounts(restaurantId),
    getDish(params.id),
  ]);

  if (!dish) notFound();
  const variants = await listVariants(dish.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return updateDish(params.id, formData);
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <BackLink href="/">Voltar ao cardápio</BackLink>
      <PageHeader title={`Editar: ${dish.name}`} description="Altere dados, foto, variantes e destaque." />
      <div className="admin-card p-6 sm:p-8">
        <DishForm
          mode="edit"
          initial={dish}
          variants={variants}
          categories={categories}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  );
}
