import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await supabase
    .from("dishes")
    .select("name, image_path")
    .not("image_path", "is", null)
    .limit(10);

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dish-images/`;
  let total = 0;
  for (const d of data ?? []) {
    const url = base + d.image_path;
    const t0 = Date.now();
    const res = await fetch(url, { method: "HEAD" });
    const ms = Date.now() - t0;
    const bytes = parseInt(res.headers.get("content-length") ?? "0", 10);
    const ct = res.headers.get("content-type") ?? "?";
    total += bytes;
    console.log(`${(bytes / 1024).toFixed(0).padStart(6)} KB  ${ms.toString().padStart(4)}ms  ${ct.padEnd(11)}  ${d.name}`);
  }
  console.log(`\nTotal amostra (${data?.length ?? 0}): ${(total / 1024).toFixed(0)} KB · média ${((total / 1024) / (data?.length || 1)).toFixed(0)} KB`);
}

main();
