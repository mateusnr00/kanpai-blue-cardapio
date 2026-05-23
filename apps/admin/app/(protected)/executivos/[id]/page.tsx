import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { getExecutivo, listExecutivoItems } from "@/lib/data/executivos";
import { ExecutivoForm } from "@/components/ExecutivoForm";
import { updateExecutivo } from "../actions";

type Params = { id: string };

export default async function EditExecutivoPage({ params }: { params: Params }) {
  const [categories, executivo] = await Promise.all([
    listCategoriesWithCounts(),
    getExecutivo(params.id),
  ]);

  if (!executivo) notFound();
  const items = await listExecutivoItems(executivo.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return updateExecutivo(params.id, formData);
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href="/executivos" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Editar: {executivo.name}</h1>
      <ExecutivoForm
        mode="edit"
        initial={executivo}
        items={items}
        categories={categories}
        onSubmit={onSubmit}
      />
    </section>
  );
}
