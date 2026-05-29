import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// Sempre dinamico: resolve o destino na hora e nao deve ser cacheado.
export const dynamic = "force-dynamic";

/**
 * Rota curta de QR code rastreado: /q/<slug>
 *
 * Procura o slug em qr_codes, redireciona pro destino (ex.: /flamboyant) ja
 * com ?src=qr-<slug>. O analytics do site grava esse source no proprio evento
 * da visita — sem tabela de clicks paralela e sem duplicar.
 *
 * Se o slug nao existir, cai na home ("/").
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  let target = "/";

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("qr_codes")
      .select("target_path")
      .eq("slug", slug)
      .maybeSingle();
    if (data?.target_path) target = data.target_path;
  } catch {
    // se a consulta falhar, ainda redireciona pra home
  }

  const url = new URL(target, req.nextUrl.origin);
  url.searchParams.set("src", `qr-${slug}`);
  return NextResponse.redirect(url, 302);
}
