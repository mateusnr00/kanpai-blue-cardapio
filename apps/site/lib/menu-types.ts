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
};

export type ExecutivoMenu = {
  name: string;
  price: string;
  format: string;
  description: string;
  validity?: string;
  subcategory?: string;
  entradas: { name: string; description: string }[];
  principais: { name: string; description: string }[];
  sobremesas?: { name: string; price: string; description: string }[];
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
  fullWidth?: boolean;
  dishes: Dish[];
  executivos?: ExecutivoMenu[];
};
