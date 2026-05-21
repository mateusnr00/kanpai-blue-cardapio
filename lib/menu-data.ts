export type Dish = {
  id: string;
  name: string;
  price: string;
  description?: string;
  featured?: boolean;
  featuredGradient?: "blue" | "beige";
  subcategory?: string;
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
  dishes: Dish[];
};

export const categories: Category[] = [
  {
    id: "ostras",
    number: "01",
    name: "Ostras",
    description: "4 itens · do aquário",
    itemCount: "4 itens",
    detail: "do aquário",
    gradient: "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)",
    subcategories: ["Todos", "Naturais", "Quentes"],
    dishes: [
      {
        id: "ostra-1",
        name: "Ostra fina de claire",
        price: "R$ 28",
        description: "Servida sobre gelo com limão siciliano e mignonette de shallot",
        subcategory: "Naturais",
      },
      {
        id: "ostra-2",
        name: "Ostra gratinada",
        price: "R$ 38",
        description: "Finalizada com manteiga de ervas e parmesão curado",
        featured: true,
        featuredGradient: "blue",
        subcategory: "Quentes",
      },
      {
        id: "ostra-3",
        name: "Ostra ponzu",
        price: "R$ 32",
        subcategory: "Naturais",
      },
      {
        id: "ostra-4",
        name: "Trio do aquário",
        price: "R$ 89",
        description: "Três variações da casa em degustação guiada",
        subcategory: "Naturais",
      },
    ],
  },
  {
    id: "sushi",
    number: "02",
    name: "Sushi",
    description: "28 itens · & sashimi",
    itemCount: "28 itens",
    detail: "& sashimi",
    gradient: "linear-gradient(135deg, #E5DEC8 0%, #D2C7AA 100%)",
    subcategories: ["Todos", "Nigiri", "Sashimi", "Uramaki", "Hot"],
    dishes: [
      {
        id: "sushi-1",
        name: "Niguiri salmão",
        price: "R$ 22",
        description: "Corte premium sobre arroz temperado com vinagre de arroz",
        subcategory: "Nigiri",
      },
      { id: "sushi-2", name: "Niguiri atum", price: "R$ 26", subcategory: "Nigiri" },
      {
        id: "sushi-3",
        name: "Niguiri hamachi",
        price: "R$ 28",
        description: "Rabo amarelo, raspa de yuzu e flor de sal",
        subcategory: "Nigiri",
      },
      {
        id: "sushi-4",
        name: "Combinado Kanpai",
        price: "R$ 189",
        description: "Seleção do chef com 24 peças variadas entre niguiri, sashimi e uramaki especiais",
        featured: true,
        featuredGradient: "blue",
        subcategory: "Hot",
      },
      { id: "sushi-5", name: "Sashimi salmão", price: "R$ 48", subcategory: "Sashimi" },
      {
        id: "sushi-6",
        name: "Sashimi atum bluefin",
        price: "R$ 78",
        description: "Cinco fatias do corte chu-toro do dia",
        subcategory: "Sashimi",
      },
      {
        id: "sushi-7",
        name: "Uramaki philadelphia",
        price: "R$ 54",
        description: "Salmão, cream cheese e cebolinha, finalizado com gergelim tostado",
        subcategory: "Uramaki",
      },
      { id: "sushi-8", name: "Hot roll camarão", price: "R$ 58", subcategory: "Hot" },
    ],
  },
  {
    id: "quentes",
    number: "03",
    name: "Quentes",
    description: "16 itens · wok, grelha, robata",
    itemCount: "16 itens",
    detail: "wok & grelha",
    gradient: "linear-gradient(135deg, #EFE9D7 0%, #DFD4B6 100%)",
    subcategories: ["Todos", "Wok", "Grelha", "Robata", "Tepan"],
    dishes: [
      {
        id: "quente-1",
        name: "Wagyu A5",
        price: "R$ 289",
        description: "Steak grelhado na robata com sal trufado, raiz de wasabi e shoyu reduzido",
        featured: true,
        featuredGradient: "blue",
        subcategory: "Robata",
      },
      {
        id: "quente-2",
        name: "Yakisoba",
        price: "R$ 68",
        description: "Macarrão wok, vegetais, frango",
        subcategory: "Wok",
      },
      {
        id: "quente-3",
        name: "Gyozas",
        price: "R$ 42",
        description: "Pasteizinhos de porco, ponzu",
        subcategory: "Wok",
      },
      { id: "quente-4", name: "Robatayaki", price: "R$ 58", subcategory: "Robata" },
      {
        id: "quente-5",
        name: "Karaage",
        price: "R$ 46",
        description: "Frango empanado, maionese yuzu",
        subcategory: "Tepan",
      },
      {
        id: "quente-6",
        name: "Lagosta thermidor",
        price: "R$ 198",
        description: "Cauda inteira gratinada com molho à base de conhaque, manteiga e ervas",
        featured: true,
        featuredGradient: "beige",
        subcategory: "Grelha",
      },
      {
        id: "quente-7",
        name: "Yakitori",
        price: "R$ 38",
        description: "Espetinhos grelhados, molho tare",
        subcategory: "Robata",
      },
      {
        id: "quente-8",
        name: "Tempurá",
        price: "R$ 52",
        subcategory: "Wok",
      },
    ],
  },
  {
    id: "festival",
    number: "04",
    name: "Festival",
    description: "Rodízio diário",
    itemCount: "7 etapas",
    detail: "Rodízio diário",
    featured: true,
    gradient: "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)",
    subcategories: ["Todos", "Frios", "Quentes", "Sobremesas"],
    dishes: [
      {
        id: "festival-1",
        name: "Festival Kanpai",
        price: "R$ 189",
        description: "Sequência completa pensada pelo chef com sete etapas que percorrem frios, quentes e sobremesa",
        featured: true,
        featuredGradient: "blue",
        subcategory: "Todos",
      },
      {
        id: "festival-2",
        name: "Edamame",
        price: "R$ 18",
        description: "Vagem cozida com flor de sal",
        subcategory: "Frios",
      },
      { id: "festival-3", name: "Harumaki", price: "R$ 32", subcategory: "Quentes" },
      {
        id: "festival-4",
        name: "Sushi do dia",
        price: "—",
        description: "Variedade de cortes selecionados pela cozinha",
        subcategory: "Frios",
      },
      { id: "festival-5", name: "Yakimeshi", price: "R$ 38", subcategory: "Quentes" },
      {
        id: "festival-6",
        name: "Robata mista",
        price: "R$ 78",
        description: "Carnes e vegetais grelhados em carvão binchotan",
        featured: true,
        featuredGradient: "beige",
        subcategory: "Quentes",
      },
      {
        id: "festival-7",
        name: "Mochi de matcha",
        price: "R$ 24",
        description: "Bolinho de arroz recheado com sorvete artesanal",
        subcategory: "Sobremesas",
      },
    ],
  },
  {
    id: "bebidas",
    number: "05",
    name: "Bebidas",
    description: "40 itens · drinks, saquês",
    itemCount: "40 itens",
    detail: "drinks & saquês",
    gradient: "linear-gradient(135deg, #E7E0CB 0%, #D5CAAE 100%)",
    subcategories: ["Todos", "Saquês", "Coquetéis", "Sem álcool"],
    dishes: [
      {
        id: "beb-1",
        name: "Sake junmai",
        price: "R$ 68",
        description: "Servido frio em tokkuri, dose 180ml",
        subcategory: "Saquês",
      },
      {
        id: "beb-2",
        name: "Sake daiginjo",
        price: "R$ 128",
        description: "Polimento 50%, notas florais e finas de pêra",
        featured: true,
        featuredGradient: "beige",
        subcategory: "Saquês",
      },
      { id: "beb-3", name: "Highball", price: "R$ 42", subcategory: "Coquetéis" },
      {
        id: "beb-4",
        name: "Yuzu sour",
        price: "R$ 38",
        description: "Gin, yuzu, clara de ovo e bitter cítrico",
        subcategory: "Coquetéis",
      },
      { id: "beb-5", name: "Chá gelado de jasmim", price: "R$ 14", subcategory: "Sem álcool" },
      {
        id: "beb-6",
        name: "Suco de lichia",
        price: "R$ 18",
        description: "Polpa fresca batida na hora com toque de hortelã",
        subcategory: "Sem álcool",
      },
    ],
  },
  {
    id: "vinhos",
    number: "06",
    name: "Vinhos",
    description: "82 rótulos · sommelier",
    itemCount: "82 rótulos",
    detail: "sommelier",
    gradient: "linear-gradient(135deg, #ECE5D1 0%, #DCD1B3 100%)",
    subcategories: ["Todos", "Brancos", "Tintos", "Espumantes"],
    dishes: [
      {
        id: "vin-1",
        name: "Riesling alemão",
        price: "R$ 248",
        description: "Mosela, notas minerais e cítricas, ótima harmonização com sashimi",
        subcategory: "Brancos",
      },
      { id: "vin-2", name: "Chablis premier cru", price: "R$ 389", subcategory: "Brancos" },
      {
        id: "vin-3",
        name: "Pinot noir borgonha",
        price: "R$ 428",
        description: "Frutas vermelhas, taninos macios e final elegante",
        featured: true,
        featuredGradient: "blue",
        subcategory: "Tintos",
      },
      {
        id: "vin-4",
        name: "Champagne brut nature",
        price: "R$ 598",
        description: "Sem dosagem, perlage fina, ideal para abertura",
        subcategory: "Espumantes",
      },
      { id: "vin-5", name: "Prosecco superiore", price: "R$ 198", subcategory: "Espumantes" },
      {
        id: "vin-6",
        name: "Sauvignon blanc Marlborough",
        price: "R$ 268",
        description: "Aromas tropicais intensos, acidez vibrante",
        subcategory: "Brancos",
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.id === slug);
}
