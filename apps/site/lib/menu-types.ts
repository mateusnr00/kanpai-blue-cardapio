// ============================================================================
// CARDÁPIO KANPAI BLUE · TIPOS
// ============================================================================
// Compartilhado entre menu-data (snapshot histórico) e menu-server (Supabase).

export type DishDetailSection = {
  label: string;
  description: string;
};

export type DishDetails = {
  longDescription?: string;
  sections: DishDetailSection[];
};

export type DishComponent = {
  kind: "entrada" | "principal" | "sobremesa";
  /** Snapshot pra render — não precisa fazer outra busca. */
  id: string;
  name: string;
  price?: string;
  description?: string;
  image?: string;
  blurDataUrl?: string;
};

export type ScheduleFields = {
  /** Programacao YYYY-MM-DD (inicio inclusivo). null = sem inicio. */
  scheduleStart?: string | null;
  /** Programacao YYYY-MM-DD (fim inclusivo). null = sem fim. */
  scheduleEnd?: string | null;
  /** Dias da semana off (0=Dom, 1=Seg, ..., 6=Sab). */
  scheduleOffDays?: number[] | null;
};

export type DishVariant = {
  name: string;
  price: string;
};

export type Dish = {
  id: string;
  name: string;
  price: string;
  unit?: string;
  description?: string;
  featured?: boolean;
  /** Texto custom do badge de destaque (default "DESTAQUE" quando vazio). */
  featuredLabel?: string;
  subcategory?: string;
  originalPrice?: string;
  tags?: string[];
  details?: DishDetails;
  image?: string;
  blurDataUrl?: string;
  components?: DishComponent[];
  /** Rótulos customizados dos grupos de componentes (keyed por kind). */
  componentLabels?: Partial<Record<DishComponent["kind"], string>>;
  variants?: DishVariant[];
} & ScheduleFields;

export type Category = {
  id: string;
  number: string;
  name: string;
  shortName?: string;
  description: string;
  itemCount: string;
  detail: string;
  featured?: boolean;
  subcategories?: string[];
  gradient: string;
  image?: string;
  slideshowImages?: string[];
  fullWidth?: boolean;
  displayMode?: "grid" | "list";
  /** Slug da categoria pai (aninhamento). undefined = categoria de topo. */
  parentSlug?: string;
  /** Override por subcategoria. Se ausente, usa displayMode (ou 'grid'). */
  subcategoryDisplayModes?: Record<string, "grid" | "list">;
  dishes: Dish[];
} & ScheduleFields;
