import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/data/categories";
import { CategoryForm } from "@/components/CategoryForm";
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
    <section className="flex flex-col gap-6">
      <Link href="/cards" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Editar: {category.name}</h1>
      <CategoryForm mode="edit" initial={category} onSubmit={onSubmit} />
    </section>
  );
}
