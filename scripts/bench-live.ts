/**
 * Benchmark live (producao kanpaiblue.com).
 * Mede waterfall completo: HTML, CSS, JS, e fotos da pagina de categoria.
 */

const BASE = "https://www.kanpaiblue.com";

async function timed(url: string, headers: Record<string, string> = {}) {
  const t0 = Date.now();
  const res = await fetch(url, { headers, redirect: "follow" });
  const buf = await res.arrayBuffer();
  return {
    ms: Date.now() - t0,
    bytes: buf.byteLength,
    status: res.status,
    type: res.headers.get("content-type"),
    cache: res.headers.get("x-vercel-cache") ?? res.headers.get("cf-cache-status") ?? "?",
  };
}

async function bench(label: string, path: string) {
  console.log(`\n=== ${label}  ${path} ===`);
  const cold = await timed(BASE + path);
  const warm = await timed(BASE + path);
  console.log(`  cold ${cold.status}  ${(cold.bytes / 1024).toFixed(1).padStart(6)} KB  ${cold.ms.toString().padStart(5)}ms  cache=${cold.cache}`);
  console.log(`  warm ${warm.status}  ${(warm.bytes / 1024).toFixed(1).padStart(6)} KB  ${warm.ms.toString().padStart(5)}ms  cache=${warm.cache}`);
  return cold;
}

async function main() {
  // 1) Paginas
  const cat = await bench("Categoria Festival", "/flamboyant/festival");
  const html = new TextDecoder().decode(await (await fetch(BASE + "/flamboyant/festival")).arrayBuffer());

  // 2) Extrai URLs de imagem do HTML
  const imgUrls = new Set<string>();
  // HTML pode ter &amp; ao inves de &
  const re = /\/_next\/image\?url=([^&"\s]+)(?:&|&amp;)w=(\d+)(?:&|&amp;)q=(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    imgUrls.add(`/_next/image?url=${m[1]}&w=${m[2]}&q=${m[3]}`);
  }
  console.log(`\nImagens no HTML: ${imgUrls.size}`);

  // 3) Mede as primeiras 6 (above-the-fold)
  console.log(`\n=== Primeiras 6 imagens via Next optimizer ===`);
  const sample = Array.from(imgUrls).slice(0, 6);
  let totalCold = 0;
  let totalWarm = 0;
  for (const url of sample) {
    const cold = await timed(BASE + url, { Accept: "image/avif,image/webp,*/*" });
    const warm = await timed(BASE + url, { Accept: "image/avif,image/webp,*/*" });
    totalCold += cold.ms;
    totalWarm += warm.ms;
    console.log(`  cold ${cold.status}  ${(cold.bytes / 1024).toFixed(0).padStart(3)} KB  ${cold.ms.toString().padStart(4)}ms  cache=${cold.cache}`);
    console.log(`  warm                 ${warm.ms.toString().padStart(4)}ms  cache=${warm.cache}`);
  }
  console.log(`\nTotal cold:  ${totalCold}ms`);
  console.log(`Total warm:  ${totalWarm}ms`);

  // 4) Tamanho do HTML
  console.log(`\nHTML bytes: ${(cat.bytes / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("ERRO:", err);
  process.exit(1);
});
