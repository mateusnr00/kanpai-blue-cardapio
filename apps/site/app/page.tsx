import { getCategories } from "@/lib/menu-server";
import type { Category } from "@/lib/menu-types";
import { HomePageClient } from "./HomePageClient";

export const revalidate = 60;

export default async function HomePage() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch (err) {
    // Build sem env do Supabase (preview deploy sem secrets): renderiza
    // homepage vazia em vez de quebrar o build. Em runtime o ISR pega
    // os dados na primeira revalidacao.
    console.warn("[HomePage] getCategories falhou:", (err as Error).message);
  }
  return <HomePageClient categories={categories} />;
}
