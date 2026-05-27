import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { count: withImage } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .not("image_path", "is", null);

  const { count: withBlur } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .not("blur_data_url", "is", null);

  const { data: sample } = await supabase
    .from("dishes")
    .select("name, image_path, blur_data_url")
    .not("image_path", "is", null)
    .limit(5);

  console.log(`Pratos com foto: ${withImage}`);
  console.log(`Pratos com blur LQIP: ${withBlur ?? 0}`);
  console.log(`Cobertura: ${withImage ? Math.round(((withBlur ?? 0) / withImage) * 100) : 0}%`);
  console.log("\nAmostra:");
  for (const d of sample ?? []) {
    console.log(`  ${d.name} — blur: ${d.blur_data_url ? `${d.blur_data_url.length}B` : "—"}`);
  }
}

main();
