/**
 * Seed do banco a partir de apps/site/lib/menu-data.ts.
 *
 * Idempotente:
 *  - categories: upsert por id (slug).
 *  - dishes: upsert por slug.
 *  - dish_detail_sections, executivo_menus, executivo_items: delete+insert por dono.
 *
 * Usa SERVICE_ROLE_KEY (bypassa RLS).
 *
 * Run:
 *   pnpm tsx scripts/seed-from-menu-data.ts
 */

import { createClient } from "@supabase/supabase-js";
import { categories } from "../apps/site/lib/menu-data";
import type { Database } from "../packages/db/src";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seed() {
  let categoryCount = 0;
  let dishCount = 0;
  let sectionCount = 0;
  let executivoCount = 0;
  let executivoItemCount = 0;

  for (const [catIdx, cat] of categories.entries()) {
    // -------- categories --------
    const { error: catErr } = await supabase
      .from("categories")
      .upsert(
        {
          id: cat.id,
          number: cat.number,
          name: cat.name,
          short_name: cat.shortName ?? null,
          description: cat.description,
          item_count: cat.itemCount ?? null,
          detail: cat.detail ?? null,
          gradient: cat.gradient,
          featured: cat.featured ?? false,
          active: true,
          position: catIdx,
          subcategories: cat.subcategories ?? [],
        },
        { onConflict: "id" }
      );

    if (catErr) {
      console.error(`category ${cat.id}:`, catErr.message);
      continue;
    }
    categoryCount++;

    // -------- dishes --------
    for (const [dishIdx, dish] of cat.dishes.entries()) {
      const { data: upserted, error: dishErr } = await supabase
        .from("dishes")
        .upsert(
          {
            slug: dish.id,
            category_id: cat.id,
            name: dish.name,
            price: dish.price || null,
            unit: dish.unit ?? null,
            description: dish.description ?? null,
            long_description: dish.details?.longDescription ?? null,
            subcategory: dish.subcategory ?? null,
            featured: dish.featured ?? false,
            featured_gradient: null,
            original_price: dish.originalPrice ?? null,
            image_path: null,
            active: true,
            position: dishIdx,
            badges: dish.tags ?? [],
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();

      if (dishErr || !upserted) {
        console.error(`dish ${dish.id}:`, dishErr?.message ?? "no row returned");
        continue;
      }
      dishCount++;

      // -------- dish_detail_sections --------
      if (dish.details?.sections?.length) {
        // limpa secoes antigas pra evitar duplicatas (idempotencia)
        await supabase.from("dish_detail_sections").delete().eq("dish_id", upserted.id);

        const sections = dish.details.sections.map((s, i) => ({
          dish_id: upserted.id,
          label: s.label,
          description: s.description,
          position: i,
        }));
        const { error: secErr } = await supabase.from("dish_detail_sections").insert(sections);
        if (secErr) {
          console.error(`sections for ${dish.id}:`, secErr.message);
        } else {
          sectionCount += sections.length;
        }
      }
    }

    // -------- executivos --------
    if (cat.executivos?.length) {
      // limpa executivos antigos da categoria
      await supabase.from("executivo_menus").delete().eq("category_id", cat.id);

      for (const [exIdx, ex] of cat.executivos.entries()) {
        const { data: exRow, error: exErr } = await supabase
          .from("executivo_menus")
          .insert({
            category_id: cat.id,
            name: ex.name,
            price: ex.price,
            format: ex.format,
            description: ex.description,
            validity: ex.validity ?? null,
            subcategory: ex.subcategory ?? null,
            position: exIdx,
            active: true,
          })
          .select("id")
          .single();

        if (exErr || !exRow) {
          console.error(`executivo ${ex.name}:`, exErr?.message ?? "no row");
          continue;
        }
        executivoCount++;

        const items = [
          ...ex.entradas.map((it, i) => ({
            executivo_id: exRow.id,
            kind: "entrada" as const,
            name: it.name,
            description: it.description,
            price: null,
            position: i,
          })),
          ...ex.principais.map((it, i) => ({
            executivo_id: exRow.id,
            kind: "principal" as const,
            name: it.name,
            description: it.description,
            price: null,
            position: i,
          })),
          ...(ex.sobremesas ?? []).map((it, i) => ({
            executivo_id: exRow.id,
            kind: "sobremesa" as const,
            name: it.name,
            description: it.description,
            price: it.price || null,
            position: i,
          })),
        ];

        if (items.length) {
          const { error: itErr } = await supabase.from("executivo_items").insert(items);
          if (itErr) {
            console.error(`items for ${ex.name}:`, itErr.message);
          } else {
            executivoItemCount += items.length;
          }
        }
      }
    }
  }

  console.log("Seed concluido:");
  console.log(`  categorias:           ${categoryCount}`);
  console.log(`  pratos:               ${dishCount}`);
  console.log(`  secoes de detalhes:   ${sectionCount}`);
  console.log(`  executivos:           ${executivoCount}`);
  console.log(`  itens de executivo:   ${executivoItemCount}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
