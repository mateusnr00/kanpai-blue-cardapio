import Link from "next/link";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { ExecutivoForm } from "@/components/ExecutivoForm";
import { createExecutivo } from "../actions";

export default async function NewExecutivoPage() {
  const categories = await listCategoriesWithCounts();

  return (
    <section className="flex flex-col gap-6">
      <Link href="/executivos" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Novo executivo</h1>
      <ExecutivoForm mode="create" categories={categories} onSubmit={createExecutivo} />
    </section>
  );
}
