/**
 * Sincroniza descrição + imagem (+ blur) de um restaurante de origem (SOURCE)
 * para outro de destino (TARGET), batendo por slug. Não cria nem deleta linhas
 * — só atualiza os campos `description`, `long_description`, `image_path`,
 * `blur_data_url` e (em categorias) `slideshow_image_paths` onde o slug bater.
 *
 * Fluxo:
 *  1. Lê SOURCE e TARGET.
 *  2. Para cada par (source, target) com mesmo slug, copia os arquivos no
 *     bucket `dish-images` pra paths novos.
 *  3. Gera `scripts/sync-descriptions-images.generated.sql` com os UPDATEs
 *     prontos — você cola no SQL Editor do Supabase pra aplicar.
 *
 * Uso:
 *   pnpm tsx scripts/sync-descriptions-images.ts                  # dry-run, só lista o que faria
 *   pnpm tsx scripts/sync-descriptions-images.ts --apply-storage  # copia files + gera .sql
 *   pnpm tsx scripts/sync-descriptions-images.ts --apply-storage --apply-db  # também aplica UPDATEs direto
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (bypassa RLS)
 *   SOURCE (default: goianiashopping)
 *   TARGET (default: flamboyant)
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Database } from "../packages/db/src";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SOURCE = process.env.SOURCE ?? "goianiashopping";
const TARGET = process.env.TARGET ?? "flamboyant";
const BUCKET = "dish-images";
const args = new Set(process.argv.slice(2));
const APPLY_STORAGE = args.has("--apply-storage");
const APPLY_DB = args.has("--apply-db");

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function extOf(path: string): string {
  const i = path.lastIndexOf(".");
  return i > 0 ? path.slice(i) : "";
}

async function copyOne(sourcePath: string, newPath: string): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET).copy(sourcePath, newPath);
  if (error) {
    console.warn(`  ! falha copiando ${sourcePath} -> ${newPath}: ${error.message}`);
    return false;
  }
  return true;
}

function sqlLiteral(v: string | null): string {
  if (v === null) return "NULL";
  return `$txt$${v.replace(/\$txt\$/g, "$ txt $")}$txt$`;
}

function sqlTextArray(arr: string[] | null): string {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  const items = arr.map((s) => sqlLiteral(s)).join(", ");
  return `ARRAY[${items}]::text[]`;
}

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type DishRow = Database["public"]["Tables"]["dishes"]["Row"];

type CategoryUpdate = {
  targetId: string;
  slug: string;
  name: string;
  description: string;
  imagePath: string | null;
  blurDataUrl: string | null;
  slideshowImagePaths: string[];
};

type DishUpdate = {
  targetId: string;
  slug: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  imagePath: string | null;
  blurDataUrl: string | null;
};

async function syncCategories(): Promise<CategoryUpdate[]> {
  console.log("\n[CATEGORIAS]");
  const { data: src, error: srcErr } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", SOURCE);
  if (srcErr) throw srcErr;
  const { data: tgt, error: tgtErr } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", TARGET);
  if (tgtErr) throw tgtErr;

  const srcBySlug = new Map<string, CategoryRow>();
  for (const c of src ?? []) srcBySlug.set(c.slug, c as CategoryRow);

  const updates: CategoryUpdate[] = [];
  let skipped = 0;
  for (const t of (tgt ?? []) as CategoryRow[]) {
    const s = srcBySlug.get(t.slug);
    if (!s) {
      skipped++;
      continue;
    }

    let newImage: string | null = null;
    if (s.image_path) {
      const path = `categories/${t.id}-clone-${Date.now().toString(36)}${extOf(s.image_path)}`;
      if (APPLY_STORAGE) {
        const ok = await copyOne(s.image_path, path);
        newImage = ok ? path : null;
      } else {
        newImage = path; // dry-run: usa o path planejado
      }
    }

    const newSlideshow: string[] = [];
    for (let i = 0; i < s.slideshow_image_paths.length; i++) {
      const p = s.slideshow_image_paths[i];
      const newP = `${t.id}-slide-${i}-clone-${Date.now().toString(36)}${extOf(p)}`;
      if (APPLY_STORAGE) {
        const ok = await copyOne(p, newP);
        if (ok) newSlideshow.push(newP);
      } else {
        newSlideshow.push(newP);
      }
    }

    updates.push({
      targetId: t.id,
      slug: t.slug,
      name: t.name,
      description: s.description,
      imagePath: newImage,
      blurDataUrl: s.blur_data_url,
      slideshowImagePaths: newSlideshow,
    });
    console.log(`  ~ ${t.slug} (${t.name})`);
  }
  console.log(`  ${updates.length} updates, ${skipped} pulados (sem match no source).`);
  return updates;
}

async function syncDishes(): Promise<DishUpdate[]> {
  console.log("\n[PRATOS]");
  const { data: src, error: srcErr } = await supabase
    .from("dishes")
    .select("*")
    .eq("restaurant_id", SOURCE);
  if (srcErr) throw srcErr;
  const { data: tgt, error: tgtErr } = await supabase
    .from("dishes")
    .select("*")
    .eq("restaurant_id", TARGET);
  if (tgtErr) throw tgtErr;

  const srcBySlug = new Map<string, DishRow>();
  for (const d of (src ?? []) as DishRow[]) {
    if (srcBySlug.has(d.slug)) {
      console.warn(`  ! slug duplicado no source: ${d.slug} — usando o primeiro.`);
      continue;
    }
    srcBySlug.set(d.slug, d);
  }

  const updates: DishUpdate[] = [];
  let skipped = 0;
  for (const t of (tgt ?? []) as DishRow[]) {
    const s = srcBySlug.get(t.slug);
    if (!s) {
      skipped++;
      continue;
    }

    let newImage: string | null = null;
    if (s.image_path) {
      const path = `${t.id}-clone-${Date.now().toString(36)}${extOf(s.image_path)}`;
      if (APPLY_STORAGE) {
        const ok = await copyOne(s.image_path, path);
        newImage = ok ? path : null;
      } else {
        newImage = path;
      }
    }

    updates.push({
      targetId: t.id,
      slug: t.slug,
      name: t.name,
      description: s.description,
      longDescription: s.long_description,
      imagePath: newImage,
      blurDataUrl: s.blur_data_url,
    });
    console.log(`  ~ ${t.slug} (${t.name})`);
  }
  console.log(`  ${updates.length} updates, ${skipped} pulados (sem match no source).`);
  return updates;
}

function buildSql(cats: CategoryUpdate[], dishes: DishUpdate[]): string {
  const lines: string[] = [];
  lines.push(`-- Sync gerado em ${new Date().toISOString()}`);
  lines.push(`-- SOURCE=${SOURCE} TARGET=${TARGET}`);
  lines.push(`-- ${cats.length} categorias e ${dishes.length} pratos serao atualizados.`);
  lines.push(`-- Cola tudo no SQL Editor do Supabase. Envolvido em transacao —`);
  lines.push(`-- se algo der erro, COMMIT nao acontece.`);
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");

  if (cats.length > 0) {
    lines.push("-- ===== CATEGORIAS =====");
    for (const c of cats) {
      lines.push(`-- ${c.slug} (${c.name})`);
      lines.push(
        `UPDATE public.categories SET\n` +
          `  description = ${sqlLiteral(c.description)},\n` +
          `  image_path = ${sqlLiteral(c.imagePath)},\n` +
          `  blur_data_url = ${sqlLiteral(c.blurDataUrl)},\n` +
          `  slideshow_image_paths = ${sqlTextArray(c.slideshowImagePaths)},\n` +
          `  updated_at = NOW()\n` +
          `WHERE id = '${c.targetId}';`,
      );
      lines.push("");
    }
  }

  if (dishes.length > 0) {
    lines.push("-- ===== PRATOS =====");
    for (const d of dishes) {
      lines.push(`-- ${d.slug} (${d.name})`);
      lines.push(
        `UPDATE public.dishes SET\n` +
          `  description = ${sqlLiteral(d.description)},\n` +
          `  long_description = ${sqlLiteral(d.longDescription)},\n` +
          `  image_path = ${sqlLiteral(d.imagePath)},\n` +
          `  blur_data_url = ${sqlLiteral(d.blurDataUrl)},\n` +
          `  updated_at = NOW()\n` +
          `WHERE id = '${d.targetId}';`,
      );
      lines.push("");
    }
  }

  lines.push("COMMIT;");
  lines.push("");
  return lines.join("\n");
}

async function applyDbDirect(cats: CategoryUpdate[], dishes: DishUpdate[]) {
  console.log("\n[APLICANDO UPDATES NO BANCO]");
  for (const c of cats) {
    const { error } = await supabase
      .from("categories")
      .update({
        description: c.description,
        image_path: c.imagePath,
        blur_data_url: c.blurDataUrl,
        slideshow_image_paths: c.slideshowImagePaths,
        updated_at: new Date().toISOString(),
      })
      .eq("id", c.targetId);
    if (error) throw new Error(`categoria ${c.slug}: ${error.message}`);
  }
  console.log(`  + ${cats.length} categorias atualizadas`);
  for (const d of dishes) {
    const { error } = await supabase
      .from("dishes")
      .update({
        description: d.description,
        long_description: d.longDescription,
        image_path: d.imagePath,
        blur_data_url: d.blurDataUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", d.targetId);
    if (error) throw new Error(`prato ${d.slug}: ${error.message}`);
  }
  console.log(`  + ${dishes.length} pratos atualizados`);
}

async function main() {
  console.log(`Sync ${SOURCE} -> ${TARGET}`);
  console.log(`  storage: ${APPLY_STORAGE ? "APLICAR (copy files)" : "dry-run (sem copiar)"}`);
  console.log(`  db: ${APPLY_DB ? "APLICAR (UPDATE direto)" : "gera .sql pra voce aplicar"}`);

  const cats = await syncCategories();
  const dishes = await syncDishes();

  const sql = buildSql(cats, dishes);
  const out = join(process.cwd(), "scripts", "sync-descriptions-images.generated.sql");
  writeFileSync(out, sql, "utf8");
  console.log(`\nSQL escrito em: ${out}`);

  if (APPLY_DB) {
    await applyDbDirect(cats, dishes);
  } else {
    console.log("Revisa o .sql e cola no SQL Editor do Supabase.");
  }

  console.log("\nFeito.");
}

main().catch((err) => {
  console.error("\nERRO:", err.message);
  process.exit(1);
});
