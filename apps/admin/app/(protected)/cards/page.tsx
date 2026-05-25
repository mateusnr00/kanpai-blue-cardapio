import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { listCategoriesAll } from "@/lib/data/categories";
import { createServerClient } from "@/lib/supabase-server";
import { CategoriesTable } from "@/components/CategoriesTable";
import { PageHeader } from "@/components/PageHeader";

async function countByCategory(): Promise<Record<string, number>> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("dishes").select("category_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const d of data ?? []) {
    counts[d.category_id] = (counts[d.category_id] ?? 0) + 1;
  }
  return counts;
}

export default async function CardsPage() {
  const [categories, dishCounts] = await Promise.all([
    listCategoriesAll(),
    countByCategory(),
  ]);

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Cards da home"
        description={`${categories.length} categoria${categories.length === 1 ? "" : "s"} · arraste para reordenar`}
        action={
          <Link href="/cards/new" className="admin-btn-primary">
            <Plus size={18} weight="bold" />
            Nova categoria
          </Link>
        }
      />

      <CategoriesTable initial={categories} dishCounts={dishCounts} />
    </section>
  );
}
