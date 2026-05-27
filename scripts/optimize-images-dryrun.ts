/**
 * Dry-run: lista todas as fotos no Storage, calcula tamanho atual,
 * processa um sample com sharp pra estimar economia.
 *
 * NAO escreve nada. Apenas relatorio.
 *
 * Uso:
 *   pnpm tsx scripts/optimize-images-dryrun.ts
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "dish-images";
const MAX_DIM = 1200;
const QUALITY = 82;
const SAMPLE_SIZE = 12;

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

  const { data: dishes, error } = await supabase
    .from("dishes")
    .select("id, name, image_path, blur_data_url, featured")
    .not("image_path", "is", null);
  if (error) throw error;

  console.log(`\n${dishes!.length} pratos com foto no banco.\n`);

  // 1) HEAD em todas — calcula tamanho total atual
  let totalCurrent = 0;
  const tiers = { huge: 0, big: 0, medium: 0, small: 0 };
  const tierBytes = { huge: 0, big: 0, medium: 0, small: 0 };
  let errors = 0;

  process.stdout.write("Levantando tamanhos atuais ");
  for (const d of dishes ?? []) {
    try {
      const res = await fetch(base + d.image_path, { method: "HEAD" });
      const bytes = parseInt(res.headers.get("content-length") ?? "0", 10);
      totalCurrent += bytes;
      if (bytes > 1_000_000) {
        tiers.huge++;
        tierBytes.huge += bytes;
      } else if (bytes > 300_000) {
        tiers.big++;
        tierBytes.big += bytes;
      } else if (bytes > 100_000) {
        tiers.medium++;
        tierBytes.medium += bytes;
      } else {
        tiers.small++;
        tierBytes.small += bytes;
      }
    } catch {
      errors++;
    }
    process.stdout.write(".");
  }
  console.log(` ok (${errors} erros)`);

  console.log(`\n=== Estado atual ===`);
  console.log(`Total no Storage:        ${(totalCurrent / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Tamanho medio:           ${(totalCurrent / dishes!.length / 1024).toFixed(0)} KB`);
  console.log(`> 1 MB (huge):           ${tiers.huge} fotos (${(tierBytes.huge / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`300 KB - 1 MB (big):     ${tiers.big} fotos (${(tierBytes.big / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`100 - 300 KB (medium):   ${tiers.medium} fotos (${(tierBytes.medium / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`< 100 KB (small):        ${tiers.small} fotos (${(tierBytes.small / 1024 / 1024).toFixed(1)} MB)`);

  // 2) Processa uma amostra REAL com sharp pra medir reducao
  console.log(`\n=== Amostra real (${SAMPLE_SIZE} fotos processadas com sharp, sem upload) ===`);
  const sample = (dishes ?? [])
    .filter((d) => d.image_path)
    .sort(() => Math.random() - 0.5)
    .slice(0, SAMPLE_SIZE);

  let beforeSample = 0;
  let afterSample = 0;
  for (const d of sample) {
    try {
      const res = await fetch(base + d.image_path);
      const buf = Buffer.from(await res.arrayBuffer());
      beforeSample += buf.length;

      const img = sharp(buf);
      const meta = await img.metadata();
      const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
      const needsResize = longest > MAX_DIM;

      const out = await sharp(buf)
        .resize(needsResize ? { width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true } : undefined)
        .webp({ quality: QUALITY })
        .toBuffer();
      afterSample += out.length;

      const pct = ((1 - out.length / buf.length) * 100).toFixed(0);
      const dim = `${meta.width}x${meta.height}`;
      console.log(`  ${(buf.length / 1024).toFixed(0).padStart(5)} KB -> ${(out.length / 1024).toFixed(0).padStart(4)} KB  (-${pct.padStart(2)}%)  ${dim.padEnd(11)}  ${d.name}`);
    } catch (e) {
      console.log(`  ! falha em ${d.name}: ${(e as Error).message}`);
    }
  }

  const reductionPct = beforeSample === 0 ? 0 : (1 - afterSample / beforeSample) * 100;
  console.log(`\nAmostra: ${(beforeSample / 1024).toFixed(0)} KB -> ${(afterSample / 1024).toFixed(0)} KB (-${reductionPct.toFixed(0)}%)`);

  const estimatedTotalAfter = totalCurrent * (afterSample / beforeSample);
  console.log(`\n=== Projecao ===`);
  console.log(`Storage atual:   ${(totalCurrent / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Storage apos:    ~${(estimatedTotalAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Economia est.:   ~${((totalCurrent - estimatedTotalAfter) / 1024 / 1024).toFixed(1)} MB (-${reductionPct.toFixed(0)}%)`);

  const withoutBlur = (dishes ?? []).filter((d) => !d.blur_data_url).length;
  console.log(`\nPratos sem LQIP hoje:    ${withoutBlur} / ${dishes!.length}`);
  console.log(`Apos otimizacao:         todos terao LQIP (gerado durante o processo)`);

  console.log(`\nNenhuma mudanca aplicada. Use optimize-images-apply.ts pra executar.`);
}

main().catch((err) => {
  console.error("ERRO:", err);
  process.exit(1);
});
