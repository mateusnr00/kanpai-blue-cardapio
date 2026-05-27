const BASE = "https://www.kanpaiblue.com";

async function main() {
  const res = await fetch(`${BASE}/flamboyant/happy-hour`);
  const html = await res.text();

  console.log(`HTML total: ${(html.length / 1024).toFixed(1)} KB`);

  // Conta diferentes elementos
  const matches = (re: RegExp) => (html.match(re) ?? []).length;
  const blurRe = /data:image\/webp;base64,[A-Za-z0-9+/=]+/g;
  const blurs = html.match(blurRe) ?? [];
  const totalBlurBytes = blurs.reduce((acc, s) => acc + s.length, 0);

  console.log(`\nEstrutura:`);
  console.log(`  <article>:           ${matches(/<article/g)}`);
  console.log(`  <img>:               ${matches(/<img/g)}`);
  console.log(`  /_next/image?:       ${matches(/\/_next\/image\?/g)}`);
  console.log(`  data:image/webp:     ${blurs.length}  (${(totalBlurBytes / 1024).toFixed(1)} KB inline)`);
  console.log(`  <script>:            ${matches(/<script/g)}`);
  console.log(`  <link>:              ${matches(/<link/g)}`);
  console.log(`  <link rel="preload": ${matches(/rel="preload"/g)}`);

  // Mostra os primeiros 3 src para verificar
  console.log(`\nPrimeiras 3 imagens otimizadas:`);
  const re = /\/_next\/image\?url=([^&"\s]+)(?:&|&amp;)w=(\d+)(?:&|&amp;)q=(\d+)/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(html)) !== null && i < 5) {
    const url = decodeURIComponent(m[1]).slice(-60);
    console.log(`  w=${m[2]} q=${m[3]}  …${url}`);
    i++;
  }

  // Verifica scripts e CSS
  console.log(`\nScripts externos:`);
  const scriptRe = /<script[^>]+src="([^"]+)"/g;
  while ((m = scriptRe.exec(html)) !== null) {
    console.log(`  ${m[1]}`);
  }
  console.log(`\nStylesheets:`);
  const cssRe = /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g;
  while ((m = cssRe.exec(html)) !== null) {
    console.log(`  ${m[1]}`);
  }
}

main();
