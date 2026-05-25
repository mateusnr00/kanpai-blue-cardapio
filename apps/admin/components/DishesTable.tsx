import { DishRow } from "./DishRow";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  dishes: DishListRow[];
};

export function DishesTable({ dishes }: Props) {
  if (dishes.length === 0) {
    return (
      <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
        Nenhum prato nesta categoria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-ink-faint bg-bg-card">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-14 px-2 py-2 sm:w-16">Foto</th>
            <th className="py-2">Nome</th>
            <th className="hidden w-24 py-2 sm:table-cell">Preço</th>
            <th className="w-16 py-2">Ativo</th>
            <th className="w-28 py-2 text-right pr-2 sm:w-32">Ações</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((d) => (
            <DishRow key={d.id} dish={d} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
