import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// Sempre dinamico: registra o scan e resolve o destino na hora (sem cache).
export const dynamic = "force-dynamic";

/**
 * Rota curta de QR code rastreado: /q/<slug>
 *
 * 1. Procura o slug em qr_codes.
 * 2. Registra UM evento 'qr_scan' (source = 'qr-<slug>') no analytics_events —
 *    no servidor, então funciona pra QUALQUER destino (home, cardapio, link
 *    externo), nao so pras paginas que tem o script de analytics.
 * 3. Redireciona pro destino escolhido no admin (target_path).
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
      .select("target_path, restaurant_id")
      .eq("slug", slug)
      .maybeSingle();

    if (data?.target_path) target = data.target_path;

    // Registra o scan (1 evento por leitura). Cada scan é um visitor/session
    // novo — server-side não temos o id do dispositivo, então contamos leituras.
    if (data?.restaurant_id) {
      await supabase.from("analytics_events").insert({
        visitor_id: crypto.randomUUID(),
        session_id: crypto.randomUUID(),
        event_type: "qr_scan",
        restaurant_id: data.restaurant_id,
        source: `qr-${slug}`,
        pathname: `/q/${slug}`,
        user_agent: req.headers.get("user-agent")?.slice(0, 200) ?? null,
      });
    }
  } catch {
    // se algo falhar, ainda redireciona
  }

  // target pode ser caminho relativo ("/", "/flamboyant") ou URL absoluta.
  const url = new URL(target, req.nextUrl.origin);
  url.searchParams.set("src", `qr-${slug}`);
  return NextResponse.redirect(url, 302);
}
