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
    <div className="overflow-hidden rounded-md border border-ink-faint bg-bg-card">
      <table className="w-full text-sm">
        <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-16 px-2 py-2">Foto</th>
            <th className="py-2">Nome</th>
            <th className="w-24 py-2">Preço</th>
            <th className="w-16 py-2">Ativo</th>
            <th className="w-32 py-2 text-right pr-2">Ações</th>
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
