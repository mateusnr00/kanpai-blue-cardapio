import Link from "next/link";
import { listExecutivos } from "@/lib/data/executivos";
import { ExecutivoDeleteButton } from "@/components/ExecutivoDeleteButton";

export default async function ExecutivosPage() {
  const executivos = await listExecutivos();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Executivos</h1>
          <p className="text-xs text-ink-soft">
            {executivos.length} menu{executivos.length === 1 ? "" : "s"} executivo{executivos.length === 1 ? "" : "s"} cadastrado{executivos.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/executivos/new"
          className="self-start rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 sm:self-auto"
        >
          + Novo executivo
        </Link>
      </div>

      {executivos.length === 0 ? (
        <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
          Nenhum executivo. Crie em + Novo executivo.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ink-faint bg-bg-card">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="py-2 pl-3">Nome</th>
                <th className="hidden py-2 sm:table-cell">Categoria</th>
                <th className="hidden w-24 py-2 sm:table-cell">Preço</th>
                <th className="w-28 py-2 text-right pr-3 sm:w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {executivos.map((ex) => (
                <tr key={ex.id} className="border-b border-ink-trace last:border-b-0">
                  <td className="py-3 pl-3">
                    <div className="text-sm font-medium">{ex.name}</div>
                    <div className="text-xs text-ink-soft">{ex.format}</div>
                    <div className="mt-1 text-xs text-ink-soft sm:hidden">
                      {ex.category_name} · {ex.price}
                    </div>
                  </td>
                  <td className="hidden py-3 text-xs text-ink-soft sm:table-cell">{ex.category_name}</td>
                  <td className="hidden py-3 text-sm sm:table-cell">{ex.price}</td>
                  <td className="py-3 pr-3 text-right">
                    <Link
                      href={`/executivos/${ex.id}`}
                      className="mr-2 inline-block rounded-md border border-ink-faint px-2 py-1 text-xs font-medium hover:border-ink sm:mr-3 sm:px-3"
                    >
                      Editar
                    </Link>
                    <ExecutivoDeleteButton id={ex.id} name={ex.name} />
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
