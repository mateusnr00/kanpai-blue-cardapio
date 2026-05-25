import Link from "next/link";
import { Plus, PencilSimple, Briefcase } from "@phosphor-icons/react/dist/ssr";
import { listExecutivos } from "@/lib/data/executivos";
import { ExecutivoDeleteButton } from "@/components/ExecutivoDeleteButton";
import { PageHeader } from "@/components/PageHeader";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

export default async function ExecutivosPage() {
  const restaurantId = getActiveRestaurantId();
  const executivos = await listExecutivos(restaurantId);

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Executivos"
        description={`${executivos.length} menu${executivos.length === 1 ? "" : "s"} executivo${executivos.length === 1 ? "" : "s"} cadastrado${executivos.length === 1 ? "" : "s"}`}
        action={
          <Link href="/executivos/new" className="admin-btn-primary">
            <Plus size={18} weight="bold" />
            Novo executivo
          </Link>
        }
      />

      {executivos.length === 0 ? (
        <div className="admin-empty">
          <Briefcase size={32} className="mx-auto mb-2 text-ink-faint" weight="duotone" />
          Nenhum executivo. Crie em Novo executivo.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="hidden sm:table-cell">Categoria</th>
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
                    <div className="mt-1 text-xs text-ink-muted sm:hidden">
                      {ex.category_name} · {ex.price}
                    </div>
                  </td>
                  <td className="hidden text-sm text-ink-muted sm:table-cell">{ex.category_name}</td>
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
      )}
    </section>
  );
}
