import Link from "next/link";
import { CategoryForm } from "@/components/CategoryForm";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <section className="flex flex-col gap-6">
      <Link href="/cards" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Nova categoria</h1>
      <CategoryForm mode="create" onSubmit={createCategory} />
    </section>
  );
}
