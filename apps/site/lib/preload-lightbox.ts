/**
 * Pre-carrega a foto que vai aparecer no lightbox. Como agora servimos direto
 * do Supabase (sem Next/Image), basta um <link rel="preload" href={src}>.
 *
 * Idempotente: nao adiciona o mesmo preload mais de uma vez.
 */

export function preloadLightboxImage(src: string): void {
  if (typeof document === "undefined") return;
  const key = src.slice(-60);
  const sel = `link[data-preload-lb="${CSS.escape(key)}"]`;
  if (document.querySelector(sel)) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  link.setAttribute("data-preload-lb", key);
  document.head.appendChild(link);
}
