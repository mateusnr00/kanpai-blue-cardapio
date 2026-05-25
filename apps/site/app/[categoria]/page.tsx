import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/menu-server";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAB } from "@/components/FAB";
import { CategoryView } from "@/components/CategoryView";

export const revalidate = 60;

export async function generateStaticParams() {
  // Em build time sem env do Supabase (ex: preview deploy sem secrets),
  // devolve lista vazia — paginas sao geradas on-demand no primeiro
  // request (dynamicParams default = true).
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ categoria: c.id }));
  } catch (err) {
    console.warn("[generateStaticParams] skip prerender:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { categoria: string } }) {
  try {
    const category = await getCategoryBySlug(params.categoria);
    if (!category) return { title: "Categoria · Kanpai Blue" };
    return {
      title: `${category.name} · Kanpai Blue`,
      description: `${category.itemCount} · ${category.detail}`,
    };
  } catch {
    return { title: "Categoria · Kanpai Blue" };
  }
}

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const [categories, category] = await Promise.all([
    getCategories(),
    getCategoryBySlug(params.categoria),
  ]);
  if (!category) notFound();

  const total = categories.length;
  const isExecutivo = !!category.executivos && category.executivos.length > 0;
  const rightLabel = isExecutivo
    ? `${category.executivos!.length} ${category.executivos!.length === 1 ? "menu" : "menus"}`
    : `${category.dishes.length} ${category.dishes.length === 1 ? "prato" : "pratos"}`;

  return (
    <AppShell>
      <Header showBack categories={categories} />
      <main style={{ position: "relative" }}>
        <CategoryView category={category} />
      </main>
      <Footer
        left={`${category.number} / ${String(total).padStart(2, "0")}`}
        right={rightLabel}
      />
      {/* Espaço pro FAB flutuante não cobrir o footer */}
      <div
        aria-hidden
        style={{
          height: "calc(74px + env(safe-area-inset-bottom))",
        }}
      />
      <FAB />
    </AppShell>
  );
}
