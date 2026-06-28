// ============================================================================
// 360° SPIN · configuração
// ----------------------------------------------------------------------------
// Registra quais pratos (por unidade) têm visualização 360°, e como montar as
// URLs dos frames no Supabase Storage (bucket público `dish-images`).
//
// COMO ADICIONAR UM 360 NOVO:
//   1) Suba os frames no bucket `dish-images`, dentro de uma pasta própria
//      (ex.: 360/combinado-do-chef/), numerados em sequência com zero à
//      esquerda: 0001.webp, 0002.webp, ... (use webp pequeno, ~800px, pra
//      carregar rápido — são muitos frames).
//   2) Adicione uma entrada no REGISTRY abaixo com a chave
//      `${unidade}::${nome do prato em minúsculas e sem acento}` e ajuste
//      folder / frames / pad / start / ext conforme os arquivos enviados.
// ============================================================================

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export type Spin360Config = {
  /** Pasta dentro do bucket dish-images (sem barra final). */
  folder: string;
  /** Quantidade de frames. */
  frames: number;
  /** Dígitos de zero-padding no número (ex.: 4 → 0001). */
  pad: number;
  /** Número do primeiro frame (normalmente 1, às vezes 0). */
  start: number;
  /** Extensão dos arquivos, sem ponto (ex.: "webp", "jpg"). */
  ext: string;
};

// Chave: `${restaurantId}::${nomeNormalizado}`.
const REGISTRY: Record<string, Spin360Config> = {
  "flamboyant::combinado do chef": {
    folder: "360/combinado-do-chef",
    frames: 200,
    pad: 4,
    start: 1,
    ext: "webp",
  },
};

export function get360Config(
  restaurantId: string,
  dish: { name: string },
): Spin360Config | null {
  return REGISTRY[`${restaurantId}::${norm(dish.name)}`] ?? null;
}

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/dish-images/`;

/** Lista de URLs dos frames, em ordem. */
export function spin360FrameUrls(cfg: Spin360Config): string[] {
  const urls: string[] = [];
  for (let i = 0; i < cfg.frames; i++) {
    const n = String(cfg.start + i).padStart(cfg.pad, "0");
    urls.push(`${STORAGE_BASE}${cfg.folder}/${n}.${cfg.ext}`);
  }
  return urls;
}
