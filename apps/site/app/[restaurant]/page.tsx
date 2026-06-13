import { notFound } from "next/navigation";
import { getCategories, getRestaurantAnnouncements, getRestaurantById, listRestaurants } from "@/lib/menu-server";
import type { Category } from "@/lib/menu-types";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { HomePageClient } from "./HomePageClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const restaurants = await listRestaurants();
    return restaurants.map((r) => ({ restaurant: r.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { restaurant: string } }) {
  const r = await getRestaurantById(params.restaurant);
  if (!r) return { title: "Kanpai Blue | Cardápio" };
  return {
    title: `${r.name} | Cardápio`,
    description: `Cardápio digital do ${r.name}.`,
  };
}

export default async function RestaurantHomePage({ params }: { params: { restaurant: string } }) {
  const restaurant = await getRestaurantById(params.restaurant);
  if (!restaurant) notFound();

  let categories: Category[] = [];
  try {
    const all = await getCategories(restaurant.id);
    // Home mostra so as categorias de topo (sem pai). As filhas aparecem
    // dentro da pagina da categoria pai.
    categories = all.filter((c) => !c.parentSlug);
  } catch (err) {
    console.warn("[RestaurantHomePage] getCategories falhou:", (err as Error).message);
  }

  let announcements: Awaited<ReturnType<typeof getRestaurantAnnouncements>> = [];
  try {
    announcements = await getRestaurantAnnouncements(restaurant.id);
  } catch (err) {
    console.warn("[RestaurantHomePage] getRestaurantAnnouncements falhou:", (err as Error).message);
  }

  return (
    <>
      <HomePageClient
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        categories={categories}
        showFooterCount={restaurant.showHomeFooterCount}
      />
      {announcements.length > 0 ? <AnnouncementModal announcements={announcements} /> : null}
    </>
  );
}
