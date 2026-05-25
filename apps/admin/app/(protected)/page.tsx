import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { listDishesByCategory } from "@/lib/data/dishes";
import { CategoryChips } from "@/components/CategoryChips";
import { DishesTableSortable } from "@/components/DishesTableSortable";
import { PageHeader } from "@/components/PageHeader";

type SearchParams = { cat?: string };

export default async function CardapioPage({ searchParams }: { searchParams: SearchParams }) {
  const categories = await listCategoriesWithCounts();
  const selectedId = searchParams.cat ?? categories[0]?.id ?? "";
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  const dishes = selected ? await listDishesByCategory(selected.id) : [];

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title={selected?.name ?? "Cardápio"}
        description={
          selected
            ? `${selected.total} ${selected.total === 1 ? "item" : "itens"} · ${selected.active} ativo${selected.active === 1 ? "" : "s"}`
            : "Selecione uma categoria"
        }
        action={
          selected ? (
            <Link href={`/dishes/new?cat=${selected.id}`} className="admin-btn-primary">
              <Plus size={18} weight="bold" />
              Novo item
            </Link>
          ) : null
        }
      />

      <CategoryChips categories={categories} selectedId={selectedId} />

      {selected ? (
        <DishesTableSortable key={selected.id} categoryId={selected.id} initial={dishes} />
      ) : null}
    </section>
  );
}
