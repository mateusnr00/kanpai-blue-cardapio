/**
 * Dispara um <link rel="preload" as="image"> com o srcset que o Next/Image
 * vai usar no lightbox. Quando o usuario clicar pra abrir, a foto ja esta
 * cacheada -> abertura instantanea.
 *
 * Idempotente: nao adiciona o mesmo preload mais de uma vez.
 */

const LIGHTBOX_WIDTHS = [480, 640, 768, 1080, 1200];
const LIGHTBOX_QUALITY = 95;
const LIGHTBOX_SIZES = "(max-width: 768px) 100vw, 1100px";

export function preloadLightboxImage(src: string): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(src);
  const key = encoded.slice(-40);
  const sel = `link[data-preload-lb="${key}"]`;
  if (document.querySelector(sel)) return;

  const srcset = LIGHTBOX_WIDTHS.map(
    (w) => `/_next/image?url=${encoded}&w=${w}&q=${LIGHTBOX_QUALITY} ${w}w`,
  ).join(", ");

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.setAttribute("imagesrcset", srcset);
  link.setAttribute("imagesizes", LIGHTBOX_SIZES);
  link.setAttribute("data-preload-lb", key);
  document.head.appendChild(link);
}
