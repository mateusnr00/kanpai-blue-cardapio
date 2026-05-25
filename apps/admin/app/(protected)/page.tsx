import Link from "next/link";
import { Plus, PencilSimple, Briefcase } from "@phosphor-icons/react/dist/ssr";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { listDishesByCategory } from "@/lib/data/dishes";
import { listExecutivosByCategory } from "@/lib/data/executivos";
import { CategoryChips } from "@/components/CategoryChips";
import { DishesTableSortable } from "@/components/DishesTableSortable";
import { ExecutivoDeleteButton } from "@/components/ExecutivoDeleteButton";
import { PageHeader } from "@/components/PageHeader";

type SearchParams = { cat?: string };

export default async function CardapioPage({ searchParams }: { searchParams: SearchParams }) {
  const categories = await listCategoriesWithCounts();
  const selectedId = searchParams.cat ?? categories[0]?.id ?? "";
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  const [dishes, executivos] = selected
    ? await Promise.all([
        listDishesByCategory(selected.id),
        listExecutivosByCategory(selected.id),
      ])
    : [[], []];

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

      {selected ? (
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">Executivos</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {executivos.length} menu{executivos.length === 1 ? "" : "s"} executivo{executivos.length === 1 ? "" : "s"} nesta categoria
            </p>
          </div>
          <Link
            href={`/executivos/new?cat=${selected.id}`}
            className="admin-btn-secondary shrink-0"
          >
            <Plus size={18} weight="bold" />
            Novo executivo
          </Link>
        </div>
      ) : null}

      {selected && executivos.length === 0 ? (
        <div className="admin-empty">
          <Briefcase size={32} className="mx-auto mb-2 text-ink-faint" weight="duotone" />
          Nenhum executivo nesta categoria.
        </div>
      ) : null}

      {selected && executivos.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="hidden w-28 sm:table-cell">Preço</th>
                <th className="w-40 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {executivos.map((ex) => (
                <tr key={ex.id}>
                  <td>
                    <div className="font-medium text-ink">{ex.name}</div>
                    <div className="text-xs text-ink-muted">{ex.format}</div>
                    <div className="mt-1 text-xs text-ink-muted sm:hidden">{ex.price}</div>
                  </td>
                  <td className="hidden font-medium tabular-nums sm:table-cell">{ex.price}</td>
                  <td className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Link href={`/executivos/${ex.id}`} className="admin-btn-ghost">
                        <PencilSimple size={16} />
                        Editar
                      </Link>
                      <ExecutivoDeleteButton id={ex.id} name={ex.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
