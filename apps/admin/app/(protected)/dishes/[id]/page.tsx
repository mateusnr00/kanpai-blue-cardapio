import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { getDish, listVariants } from "@/lib/data/dishes";
import { DishForm } from "@/components/DishForm";
import { updateDish } from "../actions";

type Params = { id: string };

export default async function EditDishPage({ params }: { params: Params }) {
  const [categories, dish] = await Promise.all([
    listCategoriesWithCounts(),
    getDish(params.id),
  ]);

  if (!dish) notFound();
  const variants = await listVariants(dish.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return updateDish(params.id, formData);
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href="/" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Editar: {dish.name}</h1>
      <DishForm
        mode="edit"
        initial={dish}
        variants={variants}
        categories={categories}
        onSubmit={onSubmit}
      />
    </section>
  );
}
