/** Logo horizontal Kanpai Blue (mesmo asset do site público) */
export const KANPAI_BLUE_LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

export const KANPAI_BLUE_LOGO_WIDTH = 1280;
export const KANPAI_BLUE_LOGO_HEIGHT = 352;

const LOGOS_BASE =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS";

/**
 * Logo de cada unidade — usada no admin como indicador da unidade ativa.
 * Para habilitar: suba os arquivos no bucket público `LOGOS` com EXATAMENTE
 * estes nomes (unit-<id>.png). Enquanto não existirem, o indicador fica oculto.
 */
export const UNIT_LOGOS: Record<string, string> = {
  flamboyant: `${LOGOS_BASE}/unit-flamboyant.png`,
  goianiashopping: `${LOGOS_BASE}/unit-goianiashopping.png`,
};
