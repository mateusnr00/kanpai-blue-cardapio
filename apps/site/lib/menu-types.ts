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

export type Dish = {
  id: string;
  name: string;
  price: string;
  unit?: string;
  description?: string;
  featured?: boolean;
  subcategory?: string;
  originalPrice?: string;
  tags?: string[];
  details?: DishDetails;
  image?: string;
  blurDataUrl?: string;
  components?: DishComponent[];
};

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
  /** Override por subcategoria. Se ausente, usa displayMode (ou 'grid'). */
  subcategoryDisplayModes?: Record<string, "grid" | "list">;
  dishes: Dish[];
};
