// Utilities/types compartilhados entre client e server.
// (Sem imports de next/headers — pode ser usado em componentes client.)

export type RestaurantRow = {
  id: string;
  name: string;
  short_name: string;
  active: boolean;
  position: number;
};

const DEFAULT_RESTAURANT = "flamboyant";
const PUBLIC_SITE_ORIGIN = "https://www.kanpaiblue.com";

/** URL do cardápio público da unidade (ex.: /flamboyant, /goianiashopping). */
export function restaurantPublicUrl(restaurantId: string): string {
  const slug = restaurantId.trim() || DEFAULT_RESTAURANT;
  return `${PUBLIC_SITE_ORIGIN}/${slug}`;
}

export const RESTAURANT_DEFAULT_ID = DEFAULT_RESTAURANT;
