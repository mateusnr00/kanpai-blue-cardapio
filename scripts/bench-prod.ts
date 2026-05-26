import { createClient } from "@supabase/supabase-js";

async function timed(url: string, headers: Record<string, string> = {}) {
  const t0 = Date.now();
  const res = await fetch(url, { headers });
  const buf = await res.arrayBuffer();
  return { ms: Date.now() - t0, bytes: buf.byteLength, status: res.status, type: res.headers.get("content-type") };
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await supabase
    .from("dishes")
    .select("name, image_path")
    .not("image_path", "is", null)
    .limit(6);

  const supabaseBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dish-images/`;
  const localBase = "http://localhost:3100";

  console.log("\n=== Foto crua direto do Supabase ===");
  for (const d of data ?? []) {
    const r = await timed(supabaseBase + d.image_path);
    console.log(`  ${(r.bytes / 1024).toFixed(0).padStart(4)} KB  ${r.ms.toString().padStart(4)}ms  ${d.name}`);
  }

  console.log("\n=== Next/Image w=384 (card thumb mobile) — cold + warm ===");
  for (const d of data ?? []) {
    const url = `${localBase}/_next/image?url=${encodeURIComponent(supabaseBase + d.image_path)}&w=384&q=80`;
    const cold = await timed(url, { Accept: "image/avif,image/webp,*/*" });
    const warm = await timed(url, { Accept: "image/avif,image/webp,*/*" });
    console.log(`  cold ${(cold.bytes / 1024).toFixed(0).padStart(3)} KB ${cold.ms.toString().padStart(4)}ms | warm ${(warm.bytes / 1024).toFixed(0).padStart(3)} KB ${warm.ms.toString().padStart(4)}ms  ${d.name}`);
  }

  console.log("\n=== Next/Image w=1200 (lightbox HD) — cold + warm ===");
  for (const d of (data ?? []).slice(0, 3)) {
    const url = `${localBase}/_next/image?url=${encodeURIComponent(supabaseBase + d.image_path)}&w=1200&q=95`;
    const cold = await timed(url, { Accept: "image/avif,image/webp,*/*" });
    const warm = await timed(url, { Accept: "image/avif,image/webp,*/*" });
    console.log(`  cold ${(cold.bytes / 1024).toFixed(0).padStart(3)} KB ${cold.ms.toString().padStart(4)}ms | warm ${(warm.bytes / 1024).toFixed(0).padStart(3)} KB ${warm.ms.toString().padStart(4)}ms  ${d.name}`);
  }

  console.log("\n=== HTML da página ===");
  for (const path of ["/flamboyant", "/flamboyant/festival", "/goianiashopping/happy-hour"]) {
    const r = await timed(`${localBase}${path}`);
    console.log(`  ${r.status}  ${(r.bytes / 1024).toFixed(0).padStart(4)} KB  ${r.ms.toString().padStart(4)}ms  ${path}`);
  }
}

main();
