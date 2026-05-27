import { createClient } from "@supabase/supabase-js";

const WHATS = "https://wa.me/556234329666?text=Ol%C3%A1!%20Vim%20pelo%20card%C3%A1pio%20digital.";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("linktree_buttons")
    .update({ href: WHATS, active: true })
    .eq("label", "Fale conosco")
    .is("parent_id", null)
    .select("id, label, href");

  if (error) throw error;
  console.log("Atualizado:", data);

  // Invalida cache do site
  const url = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (url && secret) {
    const res = await fetch(`${url.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags: ["linktree"] }),
    });
    console.log(`Revalidate: ${res.status}`);
  } else {
    console.log("(SITE_URL/REVALIDATE_SECRET nao setados, pula revalidate)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
