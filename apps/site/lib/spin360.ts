// ============================================================================
// 360° SPIN · configuração
// ----------------------------------------------------------------------------
// Registra quais pratos (por unidade) têm visualização 360°. Os frames ficam
// na pasta pública do site (apps/site/public/<folder>/) e são servidos em
// /<folder>/<arquivo>.
//
// COMO ADICIONAR UM 360 NOVO:
//   1) Suba os frames em apps/site/public/<folder>/ (ex.:
//      apps/site/public/360/combinado-do-chef/). Use webp/jpg pequenos
//      (~800px) — são muitos frames, e arquivos grandes deixam o 360 lento.
//   2) Liste os arquivos em `files`, NA ORDEM da rotação. (O viewer também
//      ordena por número, então 1.webp, 2.webp… 10.webp ficam na ordem certa.)
//   3) Adicione a entrada no REGISTRY com a chave
//      `${unidade}::${nome do prato em minúsculas e sem acento}`.
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
  /** Pasta dentro de apps/site/public (sem barra inicial/final). */
  folder: string;
  /** Nomes dos arquivos dos frames (na ordem da rotação). */
  files: string[];
};

// Chave: `${restaurantId}::${nomeNormalizado}`.
const REGISTRY: Record<string, Spin360Config> = {
  "flamboyant::combinado do chef": {
    folder: "360/combinado-do-chef",
    // Preenchido automaticamente após subir as imagens em
    // apps/site/public/360/combinado-do-chef/.
    files: [],
  },
};

export function get360Config(
  restaurantId: string,
  dish: { name: string },
): Spin360Config | null {
  return REGISTRY[`${restaurantId}::${norm(dish.name)}`] ?? null;
}

/** Lista de URLs dos frames, em ordem. */
export function spin360FrameUrls(cfg: Spin360Config): string[] {
  return cfg.files.map((f) => `/${cfg.folder}/${f}`);
}
