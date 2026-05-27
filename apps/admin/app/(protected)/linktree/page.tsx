import { PageHeader } from "@/components/PageHeader";
import { listAllButtons, buildTree } from "@/lib/data/linktree";
import { LinktreeManager } from "./LinktreeManager";

export default async function LinktreePage() {
  const rows = await listAllButtons();
  const tree = buildTree(rows);

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Linktree"
        description="Controle os botões da página inicial e dos sub-linktrees (Reservas, Localização, etc)."
      />
      <LinktreeManager initialTree={tree} />
    </section>
  );
}
