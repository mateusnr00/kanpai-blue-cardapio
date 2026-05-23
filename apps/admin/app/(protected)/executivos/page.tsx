import Link from "next/link";
import { listExecutivos } from "@/lib/data/executivos";
import { ExecutivoDeleteButton } from "@/components/ExecutivoDeleteButton";

export default async function ExecutivosPage() {
  const executivos = await listExecutivos();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executivos</h1>
          <p className="text-xs text-ink-soft">
            {executivos.length} menu{executivos.length === 1 ? "" : "s"} executivo{executivos.length === 1 ? "" : "s"} cadastrado{executivos.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/executivos/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Novo executivo
        </Link>
      </div>

      {executivos.length === 0 ? (
        <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
          Nenhum executivo. Crie em + Novo executivo.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-faint bg-bg-card">
          <table className="w-full text-sm">
            <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="py-2 pl-3">Nome</th>
                <th className="py-2">Categoria</th>
                <th className="w-24 py-2">Preço</th>
                <th className="w-32 py-2 text-right pr-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {executivos.map((ex) => (
                <tr key={ex.id} className="border-b border-ink-trace last:border-b-0">
                  <td className="py-3 pl-3">
                    <div className="text-sm font-medium">{ex.name}</div>
                    <div className="text-xs text-ink-soft">{ex.format}</div>
                  </td>
                  <td className="py-3 text-xs text-ink-soft">{ex.category_name}</td>
                  <td className="py-3 text-sm">{ex.price}</td>
                  <td className="py-3 pr-3 text-right">
                    <Link
                      href={`/executivos/${ex.id}`}
                      className="mr-3 rounded-md border border-ink-faint px-3 py-1 text-xs font-medium hover:border-ink"
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
