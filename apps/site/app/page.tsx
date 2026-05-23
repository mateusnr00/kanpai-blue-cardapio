import { getCategories } from "@/lib/menu-server";
import { HomePageClient } from "./HomePageClient";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await getCategories();
  return <HomePageClient categories={categories} />;
}
