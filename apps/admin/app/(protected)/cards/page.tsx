import Link from "next/link";
import { listCategoriesAll } from "@/lib/data/categories";
import { createServerClient } from "@/lib/supabase-server";
import { CategoriesTable } from "@/components/CategoriesTable";

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
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cards da home</h1>
          <p className="text-xs text-ink-soft">
            {categories.length} categoria{categories.length === 1 ? "" : "s"} · arraste pra reordenar.
          </p>
        </div>
        <Link
          href="/cards/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Nova categoria
        </Link>
      </div>

      <CategoriesTable initial={categories} dishCounts={dishCounts} />
    </section>
  );
}
