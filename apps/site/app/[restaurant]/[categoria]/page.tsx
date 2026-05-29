import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getRestaurantById, listRestaurants } from "@/lib/menu-server";
import { Footer } from "@/components/Footer";
import { FAB } from "@/components/FAB";
import { CategoryView } from "@/components/CategoryView";
import { CategoryHub } from "@/components/CategoryHub";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const restaurants = await listRestaurants();
    const out: { restaurant: string; categoria: string }[] = [];
    for (const r of restaurants) {
      const categories = await getCategories(r.id);
      for (const c of categories) out.push({ restaurant: r.id, categoria: c.id });
    }
    return out;
  } catch (err) {
    console.warn("[generateStaticParams] skip prerender:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { restaurant: string; categoria: string } }) {
  try {
    const r = await getRestaurantById(params.restaurant);
    if (!r) return { title: "Categoria | Kanpai Blue" };
    const category = await getCategoryBySlug(r.id, params.categoria);
    if (!category) return { title: `${r.name} | Cardápio` };
    return {
      title: `${category.name} | ${r.name}`,
      description: `${category.itemCount} - ${category.detail}`,
    };
  } catch {
    return { title: "Categoria | Kanpai Blue" };
  }
}

export default async function CategoryPage({ params }: { params: { restaurant: string; categoria: string } }) {
  const restaurant = await getRestaurantById(params.restaurant);
  if (!restaurant) notFound();

  const categories = await getCategories(restaurant.id);
  const category = categories.find((c) => c.id === params.categoria);
  if (!category) notFound();

  // Filhas dessa categoria (aninhamento).
  const childCategories = categories.filter((c) => c.parentSlug === category.id);
  const hasOwnDishes = category.dishes.length > 0;

  // Hub "puro": tem filhas e NENHUM prato proprio (ex.: Carta de Vinhos).
  // Mostra so os cards das filhas. Se a categoria tambem tiver pratos proprios
  // (ex.: Promocoes com Happy Hour + promos avulsas), cai no CategoryView
  // abaixo, que renderiza os cards das filhas E os pratos juntos.
  if (childCategories.length > 0 && !hasOwnDishes) {
    return (
      <>
        <main style={{ position: "relative" }}>
          <CategoryHub parent={category} children={childCategories} restaurantId={restaurant.id} />
        </main>
        <Footer left={category.name} right="" />
        <div aria-hidden style={{ height: "calc(74px + env(safe-area-inset-bottom))" }} />
        <FAB restaurantId={restaurant.id} />
      </>
    );
  }

  const topLevelCount = categories.filter((c) => !c.parentSlug).length;
  const rightLabel = restaurant.showCategoryFooterCount
    ? `${category.dishes.length} ${category.dishes.length === 1 ? "prato" : "pratos"}`
    : "";
  const leftLabel = restaurant.showCategoryFooterPosition
    ? `${category.number} / ${String(topLevelCount).padStart(2, "0")}`
    : "";

  return (
    <>
      <main style={{ position: "relative" }}>
        <CategoryView
          category={category}
          restaurantId={restaurant.id}
          showEyebrow={restaurant.showCategoryEyebrow}
          showSubtitle={restaurant.showCategorySubtitle}
          childCategories={childCategories}
        />
      </main>
      <Footer left={leftLabel} right={rightLabel} />
      <div
        aria-hidden
        style={{
          height: "calc(74px + env(safe-area-inset-bottom))",
        }}
      />
      <FAB restaurantId={restaurant.id} />
    </>
  );
}
