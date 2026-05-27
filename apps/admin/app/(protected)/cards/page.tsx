import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { listCategoriesAll } from "@/lib/data/categories";
import { createServerClient } from "@/lib/supabase-server";
import { CategoriesTable } from "@/components/CategoriesTable";
import { MenuDisplayToggles } from "@/components/MenuDisplayToggles";
import { PageHeader } from "@/components/PageHeader";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import type { DisplayFlag } from "./display-actions";

async function countByCategory(restaurantId: string): Promise<Record<string, number>> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dishes")
    .select("category_id")
    .eq("restaurant_id", restaurantId);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const d of data ?? []) {
    counts[d.category_id] = (counts[d.category_id] ?? 0) + 1;
  }
  return counts;
}

async function loadDisplayFlags(restaurantId: string): Promise<Record<DisplayFlag, boolean>> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "show_category_eyebrow, show_category_subtitle, show_home_footer_count, show_category_footer_count",
    )
    .eq("id", restaurantId)
    .maybeSingle();
  // 42703 = coluna inexistente. Mantem o /cards carregando se a migration
  // ainda nao rodou — os toggles aparecem como "ligado" (default).
  if (error && error.code !== "42703") {
    console.warn("[loadDisplayFlags]", error.message);
  }
  const row = data as Record<DisplayFlag, boolean | null | undefined> | null;
  return {
    show_category_eyebrow: row?.show_category_eyebrow ?? true,
    show_category_subtitle: row?.show_category_subtitle ?? true,
    show_home_footer_count: row?.show_home_footer_count ?? true,
    show_category_footer_count: row?.show_category_footer_count ?? true,
  };
}

export default async function CardsPage() {
  const restaurantId = getActiveRestaurantId();
  const [categories, dishCounts, displayFlags] = await Promise.all([
    listCategoriesAll(restaurantId),
    countByCategory(restaurantId),
    loadDisplayFlags(restaurantId),
  ]);

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Cards da home"
        description={`${categories.length} categoria${categories.length === 1 ? "" : "s"}, arraste para reordenar`}
        action={
          <Link href="/cards/new" className="admin-btn-primary">
            <Plus size={18} weight="bold" />
            Nova categoria
          </Link>
        }
      />

      <MenuDisplayToggles initial={displayFlags} />

      <CategoriesTable initial={categories} dishCounts={dishCounts} />
    </section>
  );
}
