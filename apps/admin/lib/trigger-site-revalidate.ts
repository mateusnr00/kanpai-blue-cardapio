import { tags } from "./cache-tags";

const SITE_URL = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
const SECRET = process.env.REVALIDATE_SECRET;

/**
 * Dispara revalidação de tags no site público.
 * Fire-and-forget: não bloqueia o redirect/retorno da Server Action.
 * Se SITE_URL ou REVALIDATE_SECRET não estiverem setados, vira no-op silencioso
 * (útil em dev local quando só o admin está rodando).
 */
export function triggerSiteRevalidate(tagsToRevalidate: string[]): void {
  if (!SITE_URL || !SECRET || tagsToRevalidate.length === 0) return;

  const url = `${SITE_URL.replace(/\/$/, "")}/api/revalidate`;
  fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-revalidate-secret": SECRET,
    },
    body: JSON.stringify({ tags: tagsToRevalidate }),
    cache: "no-store",
  }).catch((err) => {
    console.warn("[triggerSiteRevalidate] falhou:", (err as Error).message);
  });
}

export function revalidateMenuOnSite(restaurantId: string): void {
  triggerSiteRevalidate([tags.menu(restaurantId), tags.restaurants()]);
}

export function revalidateLinktreeOnSite(): void {
  triggerSiteRevalidate([tags.linktree()]);
}
