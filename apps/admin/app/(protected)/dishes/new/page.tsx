import Link from "next/link";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { DishForm } from "@/components/DishForm";
import { createDish } from "../actions";

export default async function NewDishPage({ searchParams }: { searchParams: { cat?: string } }) {
  const categories = await listCategoriesWithCounts();

  return (
    <section className="flex flex-col gap-6">
      <Link href="/" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Novo item</h1>
      <DishForm
        mode="create"
        categories={categories}
        defaultCategoryId={searchParams.cat}
        onSubmit={createDish}
      />
    </section>
  );
}
