/**
 * Apaga TODOS os eventos da tabela analytics_events (Flamboyant + Goiania
 * Shopping). Use depois de testes pra zerar o painel /analytics.
 *
 * NAO mexe em reviews, PostHog ou audit_log.
 */

import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { count: before } = await supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true });
  console.log(`Eventos antes: ${before ?? 0}`);

  // Por restaurante, pra ter feedback granular
  for (const r of ["flamboyant", "goianiashopping"]) {
    const { count } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", r);
    console.log(`  ${r}: ${count ?? 0} eventos`);
  }

  // DELETE com filtro impossivel de "matar tudo": usar id IS NOT NULL
  const { error } = await supabase
    .from("analytics_events")
    .delete()
    .not("id", "is", null);
  if (error) throw error;

  const { count: after } = await supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true });
  console.log(`Eventos depois: ${after ?? 0}`);
  console.log(`\nApagados: ${(before ?? 0) - (after ?? 0)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
