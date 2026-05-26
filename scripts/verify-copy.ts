import { createClient } from "@supabase/supabase-js";
import type { Database } from "../packages/db/src";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function count(restaurantId: string) {
  const { data: dishes } = await supabase
    .from("dishes")
    .select("id")
    .eq("restaurant_id", restaurantId);
  const ids = (dishes ?? []).map((d) => d.id);

  const [cats, vars, secs, comps] = await Promise.all([
    supabase.from("categories").select("id").eq("restaurant_id", restaurantId),
    ids.length ? supabase.from("dish_variants").select("id").in("dish_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("dish_detail_sections").select("dish_id").in("dish_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("dish_components").select("parent_dish_id").in("parent_dish_id", ids) : Promise.resolve({ data: [] }),
  ]);

  return {
    categories: cats.data?.length ?? 0,
    dishes: ids.length,
    variants: vars.data?.length ?? 0,
    sections: secs.data?.length ?? 0,
    components: comps.data?.length ?? 0,
  };
}

async function main() {
  const flam = await count("flamboyant");
  const gs = await count("goianiashopping");
  console.log("                flamboyant  goianiashopping");
  console.log(`categories      ${String(flam.categories).padStart(10)}  ${String(gs.categories).padStart(15)}`);
  console.log(`dishes          ${String(flam.dishes).padStart(10)}  ${String(gs.dishes).padStart(15)}`);
  console.log(`variants        ${String(flam.variants).padStart(10)}  ${String(gs.variants).padStart(15)}`);
  console.log(`sections        ${String(flam.sections).padStart(10)}  ${String(gs.sections).padStart(15)}`);
  console.log(`components      ${String(flam.components).padStart(10)}  ${String(gs.components).padStart(15)}`);
}

main();
