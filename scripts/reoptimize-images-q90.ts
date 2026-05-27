/**
 * Re-otimiza as fotos com qualidade maior (WebP q=90) usando o ARQUIVO ORIGINAL
 * como fonte (nao o ja recomprimido). Pra evitar dupla perda de qualidade.
 *
 * Estrategia:
 *   1. Recupera path original removendo o sufixo "-opt-{ts}.webp" do image_path atual
 *   2. Baixa o original. Se nao existir mais, cai no current image_path.
 *   3. Re-encoda WebP q=90 max 1200px
 *   4. Upload em novo path com sufixo "-hq-{ts}.webp"
 *   5. Atualiza dishes.image_path. Mantem o blur_data_url existente.
 *
 * Backups: arquivos "-opt-" anteriores continuam no Storage.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "dish-images";
const MAX_DIM = 1200;
const QUALITY = 90;
const CONCURRENCY = 5;

type Dish = { id: string; name: string; image_path: string };

function deriveOriginalPath(optPath: string): string | null {
  // Path otimizado: "<base>-opt-<base36>.webp"
  const match = optPath.match(/^(.+)-opt-[a-z0-9]+\.webp$/);
  if (!match) return null;
  const stem = match[1];
  // Original podia ser .jpg, .jpeg, .png, .webp, .avif
  return stem;
}

async function fetchExistingFile(
  supabaseUrl: string,
  candidates: string[],
): Promise<{ path: string; buf: Buffer } | null> {
  for (const path of candidates) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { path, buf };
    }
  }
  return null;
}

async function processOne(
  dish: Dish,
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string,
): Promise<
  | { ok: true; sourcedFrom: "original" | "current"; before: number; after: number }
  | { ok: false; reason: string }
> {
  try {
    const stem = deriveOriginalPath(dish.image_path);
    const candidates: string[] = [];
    if (stem) {
      for (const ext of ["jpg", "jpeg", "png", "webp", "avif"]) {
        candidates.push(`${stem}.${ext}`);
      }
    }
    // fallback: usa o current (recomprimido)
    candidates.push(dish.image_path);

    const found = await fetchExistingFile(supabaseUrl, candidates);
    if (!found) return { ok: false, reason: "nenhum arquivo encontrado" };

    const sourcedFrom = found.path === dish.image_path ? "current" : "original";

    const meta = await sharp(found.buf).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    const needsResize = longest > MAX_DIM;

    const webp = await sharp(found.buf)
      .resize(
        needsResize
          ? { width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true }
          : undefined,
      )
      .webp({ quality: QUALITY })
      .toBuffer();

    // Path novo: base do current sem o sufixo "-opt-..." + "-hq-..."
    const baseStem =
      stem ?? dish.image_path.replace(/\.[a-z]+$/i, "");
    const newPath = `${baseStem}-hq-${Date.now().toString(36)}.webp`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(newPath, webp, {
      contentType: "image/webp",
      upsert: false,
    });
    if (upErr) return { ok: false, reason: `upload: ${upErr.message}` };

    const { error: dbErr } = await supabase
      .from("dishes")
      .update({ image_path: newPath })
      .eq("id", dish.id);
    if (dbErr) {
      await supabase.storage.from(BUCKET).remove([newPath]).catch(() => null);
      return { ok: false, reason: `db: ${dbErr.message}` };
    }

    return { ok: true, sourcedFrom, before: found.buf.length, after: webp.length };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: rows, error } = await supabase
    .from("dishes")
    .select("id, name, image_path")
    .not("image_path", "is", null);
  if (error) throw error;
  const dishes = (rows ?? []) as Dish[];
  console.log(`\n${dishes.length} pratos pra re-otimizar (q=${QUALITY}).\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let okCount = 0;
  let fromOriginal = 0;
  let fromCurrent = 0;
  let failCount = 0;
  const fails: Array<{ name: string; reason: string }> = [];

  for (let i = 0; i < dishes.length; i += CONCURRENCY) {
    const batch = dishes.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((d) => processOne(d, supabase, supabaseUrl)));
    for (let j = 0; j < batch.length; j++) {
      const d = batch[j];
      const r = results[j];
      if (r.ok) {
        totalBefore += r.before;
        totalAfter += r.after;
        okCount++;
        if (r.sourcedFrom === "original") fromOriginal++;
        else fromCurrent++;
        const pct = ((1 - r.after / r.before) * 100).toFixed(0);
        const tag = r.sourcedFrom === "original" ? "orig" : "curr";
        console.log(`  ✓ [${tag}] ${(r.before / 1024).toFixed(0).padStart(5)} KB -> ${(r.after / 1024).toFixed(0).padStart(4)} KB  (-${pct.padStart(2)}%)  ${d.name}`);
      } else {
        failCount++;
        fails.push({ name: d.name, reason: r.reason });
        console.log(`  ✗ ${d.name}: ${r.reason}`);
      }
    }
  }

  console.log(`\n=== Resumo ===`);
  console.log(`Sucesso:               ${okCount} / ${dishes.length}`);
  console.log(`  fonte = original:    ${fromOriginal}`);
  console.log(`  fonte = current:     ${fromCurrent}`);
  console.log(`Falhas:                ${failCount}`);
  if (totalBefore > 0) {
    console.log(`Tamanho fonte:         ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Tamanho novo (q=90):   ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Reducao vs fonte:      ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
  }
  if (fails.length > 0) {
    console.log(`\nFalhas:`);
    for (const f of fails) console.log(`  - ${f.name}: ${f.reason}`);
  }
}

main().catch((err) => {
  console.error("\nERRO FATAL:", err);
  process.exit(1);
});
