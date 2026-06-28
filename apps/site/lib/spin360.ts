// ============================================================================
// 360° SPIN · configuração
// ----------------------------------------------------------------------------
// Registra quais pratos (por unidade) têm visualização 360°. Os frames ficam
// num bucket PÚBLICO do Supabase Storage e são montados por padrão de nome.
//
// COMO ADICIONAR/AJUSTAR:
//   1) Suba os frames num bucket público do Supabase.
//   2) Preencha `bucket` (nome exato, pode ter espaços) e o padrão de nome:
//      prefix + número (com `pad` dígitos, começando em `start`) + suffix + ext.
//      Ex.: arquivos "0001.webp".."0200.webp" → prefix:"", pad:4, start:1,
//      count:200, ext:"webp". Arquivos "frame_1.jpg".. → prefix:"frame_",
//      pad:0, start:1, ext:"jpg".
//   3) `count` = quantos frames. Enquanto for 0, o botão 360 não aparece.
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
  /** Nome do bucket público no Supabase (pode conter espaços/maiúsculas). */
  bucket: string;
  /** Texto antes do número no nome do arquivo. */
  prefix?: string;
  /** Texto depois do número (antes da extensão). */
  suffix?: string;
  /** Dígitos de zero-padding do número (0 = sem padding). */
  pad: number;
  /** Número do primeiro frame. */
  start: number;
  /** Quantidade de frames (0 = sem 360 ainda → botão escondido). */
  count: number;
  /** Extensão sem ponto (ex.: "webp", "jpg", "png"). */
  ext: string;
};

// Chave: `${restaurantId}::${nomeNormalizado}`.
const REGISTRY: Record<string, Spin360Config> = {
  "flamboyant::combinado do chef": {
    bucket: "Combinado do chef",
    prefix: "",
    suffix: "",
    pad: 4,
    start: 1,
    count: 0, // TODO: ajustar pro total real assim que soubermos o padrão dos nomes
    ext: "webp",
  },
};

export function get360Config(
  restaurantId: string,
  dish: { name: string },
): Spin360Config | null {
  return REGISTRY[`${restaurantId}::${norm(dish.name)}`] ?? null;
}

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/`;

/** Codifica cada segmento do caminho (preserva as barras). */
function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

/** Lista de URLs dos frames, em ordem. */
export function spin360FrameUrls(cfg: Spin360Config): string[] {
  const urls: string[] = [];
  for (let i = 0; i < cfg.count; i++) {
    const num = cfg.pad > 0 ? String(cfg.start + i).padStart(cfg.pad, "0") : String(cfg.start + i);
    const file = `${cfg.prefix ?? ""}${num}${cfg.suffix ?? ""}.${cfg.ext}`;
    urls.push(`${STORAGE_BASE}${encodePath(`${cfg.bucket}/${file}`)}`);
  }
  return urls;
}
