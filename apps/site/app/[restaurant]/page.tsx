import { notFound } from "next/navigation";
import { getCategories, getRestaurantAnnouncement, getRestaurantById, listRestaurants } from "@/lib/menu-server";
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
  if (!r) return { title: "Kanpai Blue · Cardápio" };
  return {
    title: `${r.name} · Cardápio`,
    description: `Cardápio digital do ${r.name}.`,
  };
}

export default async function RestaurantHomePage({ params }: { params: { restaurant: string } }) {
  const restaurant = await getRestaurantById(params.restaurant);
  if (!restaurant) notFound();

  let categories: Category[] = [];
  try {
    categories = await getCategories(restaurant.id);
  } catch (err) {
    console.warn("[RestaurantHomePage] getCategories falhou:", (err as Error).message);
  }

  let announcement: Awaited<ReturnType<typeof getRestaurantAnnouncement>> = null;
  try {
    announcement = await getRestaurantAnnouncement(restaurant.id);
  } catch (err) {
    console.warn("[RestaurantHomePage] getRestaurantAnnouncement falhou:", (err as Error).message);
  }

  return (
    <>
      <HomePageClient restaurantId={restaurant.id} restaurantName={restaurant.name} categories={categories} />
      {announcement ? (
        <AnnouncementModal
          imageUrl={announcement.imageUrl}
          storageKey={`kanpai-announcement-${restaurant.id}`}
        />
      ) : null}
    </>
  );
}
