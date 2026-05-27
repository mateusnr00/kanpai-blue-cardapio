import { createServerClient } from "@/lib/supabase-server";
import { getActiveRestaurantId } from "@/lib/active-restaurant";
import { PageHeader } from "@/components/PageHeader";
import { LikesToggleForm } from "./LikesToggleForm";

export const dynamic = "force-dynamic";

type TopDish = {
  id: string;
  name: string;
  slug: string;
  count: number;
  categoryName: string | null;
};

async function loadEnabled(restaurantId: string): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("restaurants")
    .select("likes_enabled")
    .eq("id", restaurantId)
    .maybeSingle();
  const row = data as { likes_enabled?: boolean | null } | null;
  return row?.likes_enabled ?? true;
}

async function loadTop10(restaurantId: string): Promise<TopDish[]> {
  const supabase = createServerClient();

  const { data: dishes, error: dishesErr } = await supabase
    .from("dishes")
    .select("id, name, slug, category:categories(name)")
    .eq("restaurant_id", restaurantId)
    .eq("active", true);
  if (dishesErr) throw dishesErr;

  const rows = (dishes ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    category: { name: string } | { name: string }[] | null;
  }>;
  if (rows.length === 0) return [];

  const ids = rows.map((d) => d.id);
  const CHUNK = 80;
  const counts = new Map<string, number>();
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const { data: likes, error: likesErr } = await supabase
      .from("dish_likes")
      .select("dish_id, count")
      .in("dish_id", slice);
    if (likesErr) throw likesErr;
    for (const l of (likes ?? []) as Array<{ dish_id: string; count: number }>) {
      counts.set(l.dish_id, l.count);
    }
  }

  const enriched: TopDish[] = rows.map((d) => {
    const cat = Array.isArray(d.category) ? d.category[0] : d.category;
    return {
      id: d.id,
      name: d.name,
      slug: d.slug,
      count: counts.get(d.id) ?? 0,
      categoryName: cat?.name ?? null,
    };
  });

  return enriched
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export default async function LikesPage() {
  const restaurantId = getActiveRestaurantId();
  const [enabled, top] = await Promise.all([loadEnabled(restaurantId), loadTop10(restaurantId)]);

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="Curtidas"
        description="Controle se o coração de curtir aparece no cardápio e veja os pratos mais curtidos do restaurante ativo."
      />

      <div className="admin-card p-6 sm:p-8">
        <LikesToggleForm initialEnabled={enabled} />
      </div>

      <div className="admin-card p-6 sm:p-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Top 10 mais curtidos</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pratos com mais curtidas do restaurante ativo. Lista atualiza em tempo real conforme os clientes
              curtem.
            </p>
          </div>
        </div>

        {top.length === 0 ? (
          <p className="rounded-lg bg-bg-surface px-4 py-6 text-center text-sm text-ink-muted ring-1 ring-ink-ghost">
            Nenhum prato curtido ainda.
          </p>
        ) : (
          <ol className="flex flex-col gap-1">
            {top.map((d, i) => (
              <li
                key={d.id}
                className="flex items-center gap-4 rounded-lg px-3 py-2.5 ring-1 ring-ink-ghost/60 odd:bg-bg-surface"
              >
                <span className="w-6 text-right text-sm font-semibold tabular-nums text-ink-faint">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{d.name}</span>
                  {d.categoryName ? (
                    <span className="block truncate text-xs text-ink-muted">{d.categoryName}</span>
                  ) : null}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink">
                  {d.count}
                  <svg width={14} height={14} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path
                      d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Z"
                      fill="#FF5353"
                    />
                  </svg>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
