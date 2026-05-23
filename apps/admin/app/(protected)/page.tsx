import Link from "next/link";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { listDishesByCategory } from "@/lib/data/dishes";
import { CategoryChips } from "@/components/CategoryChips";
import { DishesTableSortable } from "@/components/DishesTableSortable";

type SearchParams = { cat?: string };

export default async function CardapioPage({ searchParams }: { searchParams: SearchParams }) {
  const categories = await listCategoriesWithCounts();
  const selectedId = searchParams.cat ?? categories[0]?.id ?? "";
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  const dishes = selected ? await listDishesByCategory(selected.id) : [];

  return (
    <section className="flex flex-col gap-6">
      <CategoryChips categories={categories} />

      {selected ? (
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{selected.name}</h1>
            <p className="text-xs text-ink-soft">
              {selected.total} {selected.total === 1 ? "item" : "itens"} · {selected.active} ativo{selected.active === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href={`/dishes/new?cat=${selected.id}`}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Novo item
          </Link>
        </div>
      ) : null}

      {selected ? (
        <DishesTableSortable key={selected.id} categoryId={selected.id} initial={dishes} />
      ) : null}
    </section>
  );
}
