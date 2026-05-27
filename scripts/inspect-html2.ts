const BASE = "https://www.kanpaiblue.com";

async function main() {
  const res = await fetch(`${BASE}/flamboyant/happy-hour`);
  const html = await res.text();

  // Pega o primeiro <img> tag completo
  const imgRe = /<img[^>]+>/g;
  const imgs = html.match(imgRe) ?? [];
  console.log(`Total <img>: ${imgs.length}`);
  console.log(`\nPrimeiro <img>:\n${imgs[0]}\n`);
  console.log(`Segundo <img>:\n${imgs[1]}\n`);

  // Onde estao os data:image?
  const dataMatches = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]{20,})/g)];
  const unique = new Set(dataMatches.map((m) => m[1].slice(0, 60)));
  console.log(`Total ocorrencias data:image: ${dataMatches.length}`);
  console.log(`data:image unicos:            ${unique.size}`);
  console.log(`Multiplicacao media:          ${(dataMatches.length / unique.size).toFixed(1)}x`);

  // Tamanho do RSC payload (Next App Router envia dados pra hydration)
  const rscMatch = html.match(/<script[^>]+id="__NEXT_DATA__[^"]*"[^>]*>([\s\S]*?)<\/script>/);
  if (rscMatch) {
    console.log(`\n__NEXT_DATA__ inline: ${(rscMatch[1].length / 1024).toFixed(1)} KB`);
  }

  // Procura por self.__next_f.push  (RSC streaming chunks)
  const rscPush = (html.match(/self\.__next_f\.push/g) ?? []).length;
  console.log(`RSC __next_f.push chunks: ${rscPush}`);

  const rscBytes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g)]
    .reduce((acc, m) => acc + m[1].length, 0);
  console.log(`RSC payload total inline: ${(rscBytes / 1024).toFixed(1)} KB`);
}

main();
