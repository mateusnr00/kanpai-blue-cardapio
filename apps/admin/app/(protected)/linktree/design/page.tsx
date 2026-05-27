import { PageHeader } from "@/components/PageHeader";
import { getTheme } from "@/lib/data/linktree-theme";
import { DesignForm } from "./DesignForm";

export const dynamic = "force-dynamic";

export default async function LinktreeDesignPage() {
  const theme = await getTheme();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://www.kanpaiblue.com";

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Design do Linktree"
        description="Customiza o visual da home pública (/) e dos sub-linktrees (/l/…). Edita uma vez, aplica em tudo."
      />
      <DesignForm initial={theme} siteUrl={siteUrl} />
    </section>
  );
}
