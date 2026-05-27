import Link from "next/link";
import { Palette } from "@phosphor-icons/react/dist/ssr";
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
        action={
          <Link
            href="/linktree/design"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-ghost bg-bg-surface px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-bg-muted hover:text-ink"
          >
            <Palette size={16} weight="duotone" />
            Design
          </Link>
        }
      />
      <LinktreeManager initialTree={tree} />
    </section>
  );
}
