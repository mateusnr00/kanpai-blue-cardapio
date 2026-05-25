import Link from "next/link";
import { Plus, PencilSimple, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { listDishesByCategory } from "@/lib/data/dishes";
import { listExecutivosWithItemsByCategory, type ExecutivoWithItems } from "@/lib/data/executivos";
import { CategoryChips } from "@/components/CategoryChips";
import { DishesTableSortable } from "@/components/DishesTableSortable";
import { ExecutivoDeleteButton } from "@/components/ExecutivoDeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

type SearchParams = { cat?: string };

const EXECUTIVO_CATEGORY_SLUG = "executivo";

export default async function CardapioPage({ searchParams }: { searchParams: SearchParams }) {
  const restaurantId = getActiveRestaurantId();
  const categories = await listCategoriesWithCounts(restaurantId);
  const selectedSlug = searchParams.cat ?? categories[0]?.slug ?? "";
  const selected = categories.find((c) => c.slug === selectedSlug) ?? categories[0];
  const isExecutivoCategory = selected?.slug === EXECUTIVO_CATEGORY_SLUG;

  const [dishes, executivos] = selected
    ? await Promise.all([
        listDishesByCategory(selected.id),
        isExecutivoCategory
          ? listExecutivosWithItemsByCategory(selected.id)
          : Promise.resolve([] as ExecutivoWithItems[]),
      ])
    : [[], [] as ExecutivoWithItems[]];

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
          selected && !isExecutivoCategory ? (
            <Link href={`/dishes/new?cat=${selected.id}`} className="admin-btn-primary">
              <Plus size={18} weight="bold" />
              Novo item
            </Link>
          ) : isExecutivoCategory ? (
            <Link href={`/executivos/new?cat=${selected.id}`} className="admin-btn-primary">
              <Plus size={18} weight="bold" />
              Novo executivo
            </Link>
          ) : null
        }
      />

      <CategoryChips categories={categories} selectedSlug={selectedSlug} />

      {selected && !isExecutivoCategory ? (
        <DishesTableSortable key={selected.id} categoryId={selected.id} initial={dishes} />
      ) : null}

      {selected && isExecutivoCategory ? (
        <div className="flex flex-col gap-6">
          {executivos.map((ex) => (
            <ExecutivoCard key={ex.id} ex={ex} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ExecutivoCard({ ex }: { ex: ExecutivoWithItems }) {
  const entradas = ex.items.filter((it) => it.kind === "entrada");
  const principais = ex.items.filter((it) => it.kind === "principal");
  const sobremesas = ex.items.filter((it) => it.kind === "sobremesa");

  return (
    <article className="admin-card overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-ink-ghost px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">{ex.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">{ex.format}</p>
          <p className="mt-2 text-sm font-medium tabular-nums text-ink">{ex.price}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:shrink-0">
          <Link href={`/executivos/${ex.id}`} className="admin-btn-ghost">
            <PencilSimple size={16} />
            Editar
          </Link>
          <ExecutivoDeleteButton id={ex.id} name={ex.name} />
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-5">
        {ex.description ? (
          <p className="text-sm leading-relaxed text-ink-muted">{ex.description}</p>
        ) : null}
        {entradas.length > 0 ? <ItemSection title="Entradas" items={entradas} /> : null}
        {principais.length > 0 ? <ItemSection title="Principais" items={principais} /> : null}
        {sobremesas.length > 0 ? <ItemSection title="Sobremesas" items={sobremesas} /> : null}
      </div>
    </article>
  );
}

function ItemSection({
  title,
  items,
}: {
  title: string;
  items: ExecutivoWithItems["items"];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">{title}</h3>
      <ul className="flex flex-col divide-y divide-ink-trace">
        {items.map((it) => (
          <li key={it.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-ink-faint bg-bg-muted text-ink-faint">
              <ImageSquare size={20} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">{it.name}</p>
                {it.price ? (
                  <span className="text-sm font-medium tabular-nums text-ink-muted">{it.price}</span>
                ) : null}
              </div>
              {it.description ? (
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{it.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
