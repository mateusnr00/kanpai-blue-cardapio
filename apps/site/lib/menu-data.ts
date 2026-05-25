// ============================================================================
// CARDÁPIO KANPAI BLUE · METADADOS DO RESTAURANTE
// ============================================================================
// O array de categorias / pratos vive no Supabase desde a Fase 3.
// Apenas o `restaurant` const e re-exports de tipos permanecem aqui.

export type {
  DishDetailSection,
  DishDetails,
  Dish,
  Category,
} from "./menu-types";

export const restaurant = {
  name: "Kanpai Blue",
  address: "Av. Deputado Jamel Cecílio, 3300, Jardim Goiás, Goiânia, GO",
  phone: "(62) 3432-9666",
  email: "kanpaiblueadm@hotmail.com",
  instagram: "@kanpaiblue",
  hours: {
    main: "11h30 às 17h00 e 17h01 às 23h00",
    happyHour: "16h às 20h (todos os dias)",
    executivo: "Segunda a sexta, 11h30 às 15h",
  },
  note: "Promoções não acumulativas. Todas as fotos são meramente ilustrativas. Taxa de rolha: R$ 90.",
};
