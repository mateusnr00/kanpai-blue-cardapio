import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
const { count: catCount } = await sb.from("categories").select("*", { count: "exact", head: true });
const { count: dishCount } = await sb.from("dishes").select("*", { count: "exact", head: true });
const { count: secCount } = await sb.from("dish_detail_sections").select("*", { count: "exact", head: true });
const { count: exCount } = await sb.from("executivo_menus").select("*", { count: "exact", head: true });
const { count: itemCount } = await sb.from("executivo_items").select("*", { count: "exact", head: true });

const { data: cats } = await sb.from("categories").select("position,name,id").order("position");
const { data: byCat } = await sb
  .from("dishes")
  .select("category_id, name", { count: "exact" })
  .order("category_id");

const byCatCount = new Map<string, number>();
for (const d of byCat ?? []) byCatCount.set(d.category_id!, (byCatCount.get(d.category_id!) ?? 0) + 1);

console.log("Totais:");
console.log(`  categorias:           ${catCount}`);
console.log(`  pratos:               ${dishCount}`);
console.log(`  secoes de detalhes:   ${secCount}`);
console.log(`  executivos:           ${exCount}`);
console.log(`  itens de executivo:   ${itemCount}`);
console.log("\nCategorias (ordem | nome | id | #pratos):");
for (const c of cats ?? []) {
  console.log(`  ${String(c.position).padStart(2, "0")}. ${c.name.padEnd(20)} ${c.id.padEnd(20)} ${byCatCount.get(c.id) ?? 0} pratos`);
}
}

main().catch((e) => { console.error(e); process.exit(1); });
