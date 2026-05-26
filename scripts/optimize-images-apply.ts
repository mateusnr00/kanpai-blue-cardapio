/**
 * Otimiza todas as fotos do Storage (dish-images):
 *   - baixa cada uma, re-encoda como WebP q=82 max 1200px
 *   - upload em novo path (sufixo -opt) - ORIGINAL FICA COMO BACKUP
 *   - gera LQIP base64 16px e salva em dishes.blur_data_url
 *   - atualiza dishes.image_path pro novo caminho
 *
 * Modo seguro: nada e sobrescrito; em caso de erro num prato, segue os demais.
 *
 * Uso:
 *   pnpm tsx scripts/optimize-images-apply.ts
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "dish-images";
const MAX_DIM = 1200;
const QUALITY = 82;
const LQIP_DIM = 16;
const LQIP_QUALITY = 40;
const CONCURRENCY = 5;

type Dish = { id: string; name: string; image_path: string };

async function optimizeOne(
  dish: Dish,
  supabase: ReturnType<typeof createClient>,
  base: string,
): Promise<{ ok: true; before: number; after: number } | { ok: false; reason: string }> {
  try {
    const res = await fetch(base + dish.image_path);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    const before = buf.length;

    const meta = await sharp(buf).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    const needsResize = longest > MAX_DIM;

    const webp = await sharp(buf)
      .resize(
        needsResize
          ? { width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true }
          : undefined,
      )
      .webp({ quality: QUALITY })
      .toBuffer();

    const lqipBuf = await sharp(buf)
      .resize({ width: LQIP_DIM, height: LQIP_DIM, fit: "inside" })
      .webp({ quality: LQIP_QUALITY })
      .toBuffer();
    const blurDataUrl = `data:image/webp;base64,${lqipBuf.toString("base64")}`;

    // Novo path: substitui extensao por .webp e adiciona sufixo
    const dot = dish.image_path.lastIndexOf(".");
    const baseNoExt = dot > 0 ? dish.image_path.slice(0, dot) : dish.image_path;
    const newPath = `${baseNoExt}-opt-${Date.now().toString(36)}.webp`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(newPath, webp, {
      contentType: "image/webp",
      upsert: false,
    });
    if (upErr) return { ok: false, reason: `upload: ${upErr.message}` };

    const { error: dbErr } = await supabase
      .from("dishes")
      .update({ image_path: newPath, blur_data_url: blurDataUrl })
      .eq("id", dish.id);
    if (dbErr) {
      // tenta limpar o novo arquivo se o update no DB falhou (evita lixo)
      await supabase.storage.from(BUCKET).remove([newPath]).catch(() => null);
      return { ok: false, reason: `db: ${dbErr.message}` };
    }

    return { ok: true, before, after: webp.length };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

  const { data: rows, error } = await supabase
    .from("dishes")
    .select("id, name, image_path")
    .not("image_path", "is", null);
  if (error) throw error;
  const dishes = (rows ?? []) as Dish[];
  console.log(`\n${dishes.length} pratos pra otimizar.\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let okCount = 0;
  let failCount = 0;
  const fails: Array<{ name: string; reason: string }> = [];

  // batches paralelos
  for (let i = 0; i < dishes.length; i += CONCURRENCY) {
    const batch = dishes.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((d) => optimizeOne(d, supabase, base)));
    for (let j = 0; j < batch.length; j++) {
      const d = batch[j];
      const r = results[j];
      if (r.ok) {
        totalBefore += r.before;
        totalAfter += r.after;
        okCount++;
        const pct = ((1 - r.after / r.before) * 100).toFixed(0);
        console.log(`  ✓ ${(r.before / 1024).toFixed(0).padStart(5)} KB -> ${(r.after / 1024).toFixed(0).padStart(4)} KB  (-${pct.padStart(2)}%)  ${d.name}`);
      } else {
        failCount++;
        fails.push({ name: d.name, reason: r.reason });
        console.log(`  ✗ ${d.name}: ${r.reason}`);
      }
    }
  }

  console.log(`\n=== Resumo ===`);
  console.log(`Sucesso: ${okCount} / ${dishes.length}`);
  console.log(`Falhas:  ${failCount}`);
  if (totalBefore > 0) {
    console.log(`Antes:   ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Depois:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Reducao: ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
  }
  if (fails.length > 0) {
    console.log(`\nFalhas:`);
    for (const f of fails) console.log(`  - ${f.name}: ${f.reason}`);
  }
  console.log(`\nArquivos originais permanecem no Storage como backup.`);
}

main().catch((err) => {
  console.error("\nERRO FATAL:", err);
  process.exit(1);
});
