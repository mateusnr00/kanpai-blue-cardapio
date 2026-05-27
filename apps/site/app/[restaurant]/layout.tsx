import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { LikesEnabledProvider } from "@/components/LikesEnabledProvider";
import { getCategories, getRestaurantById } from "@/lib/menu-server";

/**
 * Layout compartilhado entre /[restaurant] e /[restaurant]/[categoria].
 *
 * O Header (com logo Kanpai + Linq + search) e a AppShell ficam montados
 * nesse nivel — ao navegar entre home -> categoria, eles NAO desmontam,
 * eliminando o flash da logo recarregando.
 */
export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { restaurant: string };
}) {
  const restaurant = await getRestaurantById(params.restaurant);
  if (!restaurant) notFound();

  // getCategories e cacheado com unstable_cache, sem custo extra de DB nas paginas filhas
  const categories = await getCategories(restaurant.id);

  return (
    <AppShell>
      <LikesEnabledProvider enabled={restaurant.likesEnabled}>
        <Header categories={categories} restaurantId={restaurant.id} />
        {children}
      </LikesEnabledProvider>
    </AppShell>
  );
}
