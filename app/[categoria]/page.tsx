import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/lib/menu-data";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAB } from "@/components/FAB";
import { CategoryView } from "@/components/CategoryView";

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.id }));
}

export function generateMetadata({ params }: { params: { categoria: string } }) {
  const category = getCategoryBySlug(params.categoria);
  if (!category) return { title: "Categoria · Kanpai Blue" };
  return {
    title: `${category.name} · Kanpai Blue`,
    description: `${category.itemCount} · ${category.detail}`,
  };
}

export default function CategoryPage({ params }: { params: { categoria: string } }) {
  const category = getCategoryBySlug(params.categoria);
  if (!category) notFound();

  const total = categories.length;
  const isExecutivo = !!category.executivos && category.executivos.length > 0;
  const rightLabel = isExecutivo
    ? `${category.executivos!.length} ${category.executivos!.length === 1 ? "menu" : "menus"}`
    : `${category.dishes.length} ${category.dishes.length === 1 ? "prato" : "pratos"}`;

  return (
    <AppShell>
      <Header showBack />
      <main style={{ position: "relative" }}>
        <CategoryView category={category} />
        <FAB />
      </main>
      <Footer
        left={`${category.number} / ${String(total).padStart(2, "0")}`}
        right={rightLabel}
      />
    </AppShell>
  );
}
