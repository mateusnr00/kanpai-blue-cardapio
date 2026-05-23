// ============================================================================
// CARDÁPIO KANPAI BLUE · DADOS COMPLETOS
// ============================================================================
// Restaurante japonês contemporâneo, Goiânia/GO.
// Para editar conteúdo: altere os arrays abaixo. Cada categoria tem:
//   - meta (nome, número, descrição, subcategorias)
//   - dishes (array de pratos com nome, preço, descrição opcional, featured opcional)
// ============================================================================

import type { Category } from "./menu-types";

export type {
  DishDetailSection,
  DishDetails,
  Dish,
  ExecutivoMenu,
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

// ============================================================================
// CATEGORIAS · ORDEM DE APARIÇÃO NA HOME
// ============================================================================

export const categories: Category[] = [
  // ==========================================================================
  // 01. FESTIVAL (Featured · destaque azul Kanpai no índice)
  // ==========================================================================
  {
    id: "festival",
    number: "01",
    name: "Festival",
    description: "2 menus · principal experiência da casa",
    itemCount: "2 menus",
    detail: "Festival Premium e Experience",
    featured: true,
    gradient: "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)",
    dishes: [
      {
        id: "fest-fds",
        name: "Festival Premium",
        price: "R$ 174,90",
        description: "Entradas variadas, sushis, sashimis e sobremesa. Com reposição. Servido de sexta a domingo.",
        featured: true,
        tags: ["Não compartilhável"],
        details: {
          longDescription:
            "Entradas variadas, sushis, sashimis e sobremesa. Com reposição. Não inclui todos os pratos do cardápio. Válido somente para consumo no restaurante. Em caso de viagem considerar o preço de R$ 5,50 por peça.",
          sections: [
            {
              label: "Entradas Da Cozinha",
              description:
                "Camarão empanado, guioza, isca de tilápia, pipoquinha de camarão, edamame e casquinha de siri gratinada no queijo parmesão.",
            },
            {
              label: "Entradas Do Sushibar",
              description:
                "Variedade de pratos clássicos do Kanpai Blue: Shake hara (salmão com crispy de batata doce), carpaccio salmão / Saint Peter, tataki, tartar do chef servido no gelo, dyo camarão flambado, sashimi maçaricado servido sob cama de shimeji, entre outros, servidos à vontade.",
            },
            {
              label: "Combinado Individual",
              description:
                "Variação de sushis, sashimis, niguiris e Hot Roll filadelphia à vontade.",
            },
            {
              label: "Sobremesa",
              description:
                "Tempurá de sorvete, panqueca brulée com doce de leite argentino ou brigadeiro de colher.",
            },
          ],
        },
      },
      {
        id: "fest-experience",
        name: "Menu Experience",
        price: "R$ 144,90",
        description: "Seleção LIMITADA de pratos da casa: entradas variadas, combinado com sushis, sashimis e sobremesa. Sem reposição.",
        featured: true,
        details: {
          longDescription:
            "Seleção LIMITADA de pratos da casa, composta por entradas variadas, combinado com sushis, sashimis e sobremesa. Sem reposição. Não inclui todos os pratos do cardápio.",
          sections: [
            {
              label: "Entradas Da Cozinha",
              description:
                "Guioza, isca de tilápia, e casquinha de siri gratinada no queijo parmesão.",
            },
            {
              label: "Entradas Do Sushibar",
              description:
                "Carpaccio misto de salmão / Saint Peter, tataki, Hot mix (Hot Roll Salmão / Hot Skin) e Tartar do Chef servido no gelo.",
            },
            {
              label: "Combinado Individual",
              description:
                "Variação de sushis e sashimis com 14 peças: 8 sushis e 6 sashimis.",
            },
            {
              label: "Sobremesa",
              description: "Tempurá de sorvete ou brigadeiro de colher.",
            },
          ],
        },
      },
    ],
  },

  // ==========================================================================
  // 02. PROMOÇÕES (semanais + diárias não-festival)
  // ==========================================================================
  {
    id: "promocoes",
    number: "02",
    name: "Promoções",
    description: "7 promoções · semanais e diárias",
    itemCount: "7 promoções",
    detail: "semanais e diárias",
    subcategories: ["Todos", "Semanais", "Diárias"],
    gradient: "linear-gradient(135deg, #E5DEC8 0%, #D2C7AA 100%)",
    dishes: [
      {
        id: "prom-segunda",
        name: "Segunda · Ladies Only",
        price: "R$ 129,90",
        description: "Todas as segundas o Festival Premium Kanpai com valor promocional para elas.",
        featured: true,
        subcategory: "Semanais",
        tags: ["Não compartilhável"],
      },
      {
        id: "prom-terca",
        name: "Terça Gastronômica",
        price: "R$ 159,90",
        originalPrice: "R$ 184,90",
        description: "Festival Premium Kanpai com valor promocional + bebidas em refil (refrigerante, água, suco, soda italiana, sabores do dia). Por pessoa.",
        subcategory: "Semanais",
        tags: ["Não compartilhável"],
      },
      {
        id: "prom-quarta",
        name: "Quarta Delas",
        price: "R$ 194,90",
        description: "Festival Premium Kanpai COM REPOSIÇÃO + espumante Brut e Rosé + Aperol Spritz + Moscow Blue à vontade. Válido para homens e mulheres. Não será servido mais de um drink ou espumante por vez.",
        featured: true,
        subcategory: "Semanais",
        tags: ["Não compartilhável"],
      },
      {
        id: "prom-quinta-festival",
        name: "Quinta · Festival Premium",
        price: "R$ 164,90",
        originalPrice: "R$ 184,90",
        description: "Festival Premium Kanpai com valor promocional + bebidas em refil (refrigerante, água, suco, soda italiana, sabores do dia).",
        subcategory: "Semanais",
        tags: ["Não compartilhável"],
      },
      {
        id: "prom-wine-experience",
        name: "Quinta · Wine Experience",
        price: "",
        description: "Todos os rótulos de vinho com 20% OFF, válido apenas às quintas.",
        subcategory: "Semanais",
      },
      {
        id: "prom-ostras-day",
        name: "Quinta · Ostra's Day",
        price: "",
        description: "Todas as quintas chegam ostras frescas no Kanpai.",
        subcategory: "Semanais",
      },
      {
        id: "prom-happy-hour",
        name: "Happy Hour Kanpai",
        price: "",
        description: "Das 16h às 20h, todos os dias. Drinks e pratos com descontos.",
        featured: true,
        subcategory: "Diárias",
      },
    ],
  },

  // ==========================================================================
  // 03. MENU EXECUTIVO (categoria especial com 2 menus featured)
  // ==========================================================================
  {
    id: "executivo",
    number: "03",
    name: "Menu Executivo",
    description: "Almoço · 2 menus disponíveis",
    itemCount: "2 menus",
    detail: "almoço executivo",
    subcategories: ["Todos", "Contemporâneo", "Oriental"],
    gradient: "linear-gradient(135deg, #E5DEC8 0%, #D2C7AA 100%)",
    dishes: [],  // executivo usa o array `executivos` abaixo, não dishes
    executivos: [
      {
        name: "Executivo Contemporâneo",
        price: "R$ 79,90",
        format: "Entrada + Prato Principal",
        description: "Menu elaborado pelo renomado Chef Lucas Santos, fundador do Restaurante Lote 17. Massas, proteínas e risotos para o almoço executivo do Kanpai.",
        validity: "Segunda a sexta, 11h30 às 15h",
        subcategory: "Contemporâneo",
        entradas: [
          { name: "Salada Caesar", description: "Acelga, molho caesar, croutons e lascas de parmesão." },
          { name: "Croquete de Costela", description: "Croquete de costela com maionese de pimenta." },
          { name: "Mini Burger de Fraldinha", description: "Burger de fraldinha, cebola caramelizada, pesto de rúcula e passata de tomate." },
        ],
        principais: [
          { name: "Robalo", description: "Purê de abóbora, vagem tostada e molho cítrico." },
          { name: "Espaguete com Camarões", description: "Massa cremosa de camarão finalizada com camarão empanado." },
          { name: "Filé Mignon", description: "Crispy de batata-doce, risoto de parmesão e aioli de ervas." },
          { name: "Risoto Ratatouille", description: "Abobrinha, berinjela, tomate, pimentão, parmesão e tomilho." },
        ],
        sobremesas: [
          { name: "Bolo Gelado de Coco", price: "R$ 9,90", description: "Ganache de maracujá e sorvete." },
          { name: "Ninho al Crumble", price: "R$ 9,90", description: "Creme de leite ninho, crumble e sorbet de morango." },
        ],
      },
      {
        name: "Executivo Oriental",
        price: "R$ 89,90",
        format: "Entrada + Prato Principal",
        description: "Servido todos os dias, das 11h30 às 15h.",
        validity: "Todos os dias, 11h30 às 15h",
        subcategory: "Oriental",
        entradas: [
          { name: "Ceviche de Tilápia", description: "Uva verde, milho peruano, azeite verde e raspadinha de pimenta dedo-de-moça." },
          { name: "Carpaccio de Salmão", description: "Aioli de maracujá, molho ponzu, crocante de arroz e ovas de capelin." },
          { name: "Salada de Frutos do Mar", description: "Mix de folhas, tomate confit, carpaccio de salmão curado, camarão crocante e molho oriental." },
          { name: "Mini Burger Suíno", description: "Passata fresca de tomate e mayo nippon (maionese japonesa da casa)." },
        ],
        principais: [
          { name: "Tonkatsu", description: "Lombo suíno empanado ao molho agridoce japonês, purê de mandioquinha com gengibre e couve crispy." },
          { name: "Filé Mignon", description: "Ao molho de shoyu trufado com risoto de shimeji finalizado com redução de balsâmico." },
          { name: "Risoto Nero", description: "Lula empanada com risoto de tinta de lula e raspas de limão siciliano." },
          { name: "Mini Combinado 12 Peças Kanpai", description: "Combinado especial selecionado pelo sushibar." },
        ],
      },
    ],
  },

  // ==========================================================================
  // 04. ENTRADAS (Menu Principal)
  // ==========================================================================
  {
    id: "entradas",
    number: "04",
    name: "Entradas",
    description: "19 entradas · pasteizinhos, ceviches, frutos do mar",
    itemCount: "19 entradas",
    detail: "para começar",
    gradient: "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)",
    dishes: [
      { id: "ent-01", name: "Pipoquinha Crocante de Camarão Spicy", price: "R$ 57,90", featured: true },
      { id: "ent-02", name: "Pasteizinhos Queijo Brie", price: "R$ 39,90", unit: "8 unidades" },
      { id: "ent-03", name: "Pasteizinhos Camarão", price: "R$ 42,90", unit: "8 unidades", description: "Pasteizinhos com recheio de bobó de camarão." },
      { id: "ent-04", name: "Dupla de Croquete", price: "R$ 16,90", unit: "2 unidades", description: "Croquete de costela." },
      { id: "ent-05", name: "Sunomono", price: "R$ 34,00", description: "Pepino e cenoura ao molho agridoce com kani e polvo." },
      { id: "ent-06", name: "Bolinho de Salmão", price: "R$ 29,90", unit: "10 unidades", description: "Bolinho de salmão com especiarias." },
      { id: "ent-07", name: "Casquinha de Siri", price: "R$ 24,90", unit: "2 unidades" },
      { id: "ent-08", name: "Guiosa de Pernil", price: "R$ 32,90", unit: "5 unidades", description: "Massa finíssima, crocante por baixo e transparente por cima, recheada com pernil, cebola, broto de alho, gengibre e repolho. Ligeiramente picante." },
      { id: "ent-09", name: "Isca de Saint Peter", price: "R$ 42,90", description: "Filé de peixe branco à milanesa com molhos especiais." },
      { id: "ent-10", name: "Lula à Milanesa", price: "R$ 48,00", description: "Anéis de lula à milanesa com molho especial." },
      { id: "ent-11", name: "Lula Recheada", price: "R$ 62,90", description: "Lula em tubo grelhada recheada com shimeji e molho tarê.", featured: true },
      { id: "ent-12", name: "Missoshiro", price: "R$ 22,90", description: "Sopa de massa de soja com tofu, hanakatsuo e cebolinha." },
      { id: "ent-13", name: "Mix de Frutos do Mar", price: "R$ 69,00", description: "Porções de harumaki de siri, lula, camarão e Saint Peter à milanesa." },
      { id: "ent-14", name: "Rolinho Primavera", price: "R$ 34,90", unit: "4 unidades", description: "Massa harumaki recheada com vegetais e pernil." },
      { id: "ent-15", name: "Mix de Camarão", price: "R$ 69,00", description: "4 variações de camarões empanados." },
      { id: "ent-16", name: "Shimeji", price: "R$ 46,90", description: "Pequenos e delicados cogumelos shimeji, grelhados na manteiga e molho especial, servidos sobre uma cama de abacaxi.", featured: true },
      { id: "ent-17", name: "Shitake", price: "R$ 44,90", description: "Cogumelos pretos de sabor pronunciado, temperados e grelhados na manteiga e molho especial." },
      { id: "ent-18", name: "Mini Lula Guessô", price: "R$ 58,00", description: "Anéis de mini lula e cabeça de mini lula crocantes." },
      { id: "ent-19", name: "Maguro Tropical", price: "R$ 69,00", description: "Atum selado na crosta de gergelim, vinagrete de tomate cereja com limão siciliano, azeite de oliva e lâminas frescas de manga.", featured: true },
    ],
  },

  // ==========================================================================
  // 05. SELEÇÕES PREMIUM KANPAI
  // ==========================================================================
  {
    id: "selecoes-premium",
    number: "05",
    name: "Seleções Premium",
    description: "15 premium · alta gastronomia da casa",
    itemCount: "15 premium",
    detail: "carpaccios, tartares, vieiras",
    gradient: "linear-gradient(135deg, #ECE5D1 0%, #DCD1B3 100%)",
    dishes: [
      { id: "pr-01", name: "Carpaccio Kanpai", price: "R$ 64,90", unit: "20 a 24 peças", description: "Combinação perfeita de finíssimas fatias de 3 peixes (atum, salmão e peixe branco), cada um no seu tempero, finalizado com quinoa.", featured: true },
      { id: "pr-02", name: "Carpaccio Ussuzukuri de Polvo Trufado", price: "R$ 87,90", unit: "20 a 24 peças", description: "Finas lâminas de polvo regadas com azeite trufado, salsa trufada, flor de sal, cebolinha, ovas de massagô e raspas de limão siciliano.", featured: true },
      { id: "pr-03", name: "Ussuzukuri de Barriga de Salmão", price: "R$ 72,00", description: "Carpaccio de barriga de salmão, azeite trufado, calda de limão siciliano, gergelim, pimenta dedo-de-moça e cebolinha." },
      { id: "pr-04", name: "Seleção de Niguiris Premium", price: "R$ 79,00", unit: "5 unidades", description: "Niguiris minuciosamente elaborados com iguarias escolhidas pelos chefs: atum foie gras, vieira, camarão rosa, ovas black e polvo com ovas massagô." },
      { id: "pr-05", name: "Sashimi de Barriga de Salmão", price: "R$ 52,90", unit: "6 unidades", description: "Iguaria feita com corte de salmão, salpicada com azeite trufado, molho ponzu e finalizada com raspa de limão." },
      { id: "pr-06", name: "Ebi Kanpai", price: "R$ 49,90", unit: "6 unidades", description: "Camarão empanado, envolto no sashimi de barriga de salmão, ovas massagô, limão, servido na pedra de sal." },
      { id: "pr-07", name: "Palitinho Kumi Kanpai", price: "R$ 39,90", unit: "4 unidades", description: "Cubos de salmão, camarão e vinagrete finalizados com ovas e maionese da casa, servido ao molho ponzu cítrico." },
      { id: "pr-08", name: "Tako Kanpai", price: "R$ 53,90", unit: "6 unidades", description: "Polvo fatiado, envolto no sashimi de barriga de salmão, molho vinagrete, broto, pimenta togarashi e quinoa." },
      { id: "pr-09", name: "Tartar de Salmão do Chef", price: "R$ 52,90", description: "Mini cubos de salmão fresco ao molho thai, finalizado com crispy de alho-poró." },
      { id: "pr-10", name: "Shisso Kanpai", price: "R$ 29,90", unit: "4 unidades", description: "Tempurá de alga com tartar de salmão, finalizado com molho tarê." },
      { id: "pr-11", name: "Duplas de Vieiras Canadense", price: "R$ 44,90", description: "Vieira canadense selada na manteiga trufada e finalizada com salsa trufada." },
      { id: "pr-12", name: "Uramaki Mostarda Kanpai", price: "R$ 49,90", unit: "8 unidades", description: "Alga envolta por arroz, recheado com camarão empanado, finalizado com salmão e cream cheese maçaricados, mostarda dijon, molho tarê e cebolinha." },
      { id: "pr-13", name: "Maravilha de Camarão", price: "R$ 44,90", unit: "4 unidades", description: "Lâminas de salmão com camarão e alcaparras empanados, finalizado com molho tarê." },
      { id: "pr-14", name: "Katsu Kanpai", price: "R$ 49,90", description: "Polvo e camarão com maionese especial e crocante de canapé." },
      { id: "pr-15", name: "Temarizushi de Salmão e Atum", price: "R$ 44,90", unit: "6 unidades", description: "Bolinho de arroz coberto com fatia de salmão e atum, finalizado com molho especial de maracujá." },
    ],
  },

  // ==========================================================================
  // 06. DUPLAS ESPECIAIS
  // ==========================================================================
  {
    id: "duplas-especiais",
    number: "06",
    name: "Duplas Especiais",
    description: "5 duplas · niguiris e ikuras",
    itemCount: "5 duplas",
    detail: "ovas e finalizações",
    gradient: "linear-gradient(135deg, #E7E0CB 0%, #D5CAAE 100%)",
    dishes: [
      { id: "dp-01", name: "Dupla de Ikura", price: "R$ 29,90", description: "Bolinho de arroz envolto com alga, recheio de ovas de salmão." },
      { id: "dp-02", name: "Dupla de Massagô", price: "R$ 29,90", description: "Bolinho de arroz envolto com alga, recheio de ovas de arenque." },
      { id: "dp-03", name: "Dupla de Niguiri de Atum com Ovas Black", price: "R$ 24,90", description: "Niguiris de atum finalizado com ovas black." },
      { id: "dp-04", name: "Dupla de Niguiris de Barriga de Salmão Trufada", price: "R$ 18,90", description: "Niguiris de barriga de salmão, finalizada com azeite de trufas e raspa de limão siciliano." },
      { id: "dp-05", name: "Dupla de Tobiko", price: "R$ 29,90", description: "Bolinho de arroz envolto com alga, recheio de ovas de peixe voador." },
    ],
  },

  // ==========================================================================
  // 07. COMBINADOS (combinados + sashimis)
  // ==========================================================================
  {
    id: "combinados",
    number: "07",
    name: "Combinados",
    description: "12 combinados · pra dividir ou degustar",
    itemCount: "12 itens",
    detail: "combinados, sashimis",
    gradient: "linear-gradient(135deg, #E5DEC8 0%, #D2C7AA 100%)",
    subcategories: ["Todos", "Combinados", "Sashimis"],
    dishes: [
      { id: "cs-01", name: "Combinado Osaka", price: "R$ 119,00", description: "19 peças variadas de sushis, sashimis e gunkans.", featured: true, subcategory: "Combinados" },
      { id: "cs-02", name: "Combinado Sushi Kanpai", price: "R$ 99,90", description: "19 peças variadas de sushis selecionados.", subcategory: "Combinados" },
      { id: "cs-03", name: "Combinado Okinawa", price: "R$ 238,00", description: "40 peças, sendo 22 sushis e 18 sashimis.", featured: true, subcategory: "Combinados" },
      { id: "cs-04", name: "Combinado do Chef", price: "R$ 398,00", description: "48 unidades. Seleção especial de sushis e sashimis escolhidos pelo sushiman chef.", featured: true, subcategory: "Combinados" },
      { id: "cs-05", name: "Sashimi Especial", price: "R$ 149,00", unit: "32 unidades", description: "Sashimis variados entre salmão, atum, peixe branco, polvo, kani e camarão.", subcategory: "Sashimis" },
      { id: "cs-06", name: "Sashimi Kanpai", price: "R$ 79,90", unit: "18 unidades", description: "Sashimis variados entre salmão, atum e peixe branco.", subcategory: "Sashimis" },
      { id: "cs-07", name: "Sashimi Shake", price: "R$ 42,90", unit: "9 fatias", description: "Salmão.", subcategory: "Sashimis" },
      { id: "cs-08", name: "Sashimi Maguro", price: "R$ 44,00", unit: "9 fatias", description: "Atum.", subcategory: "Sashimis" },
      { id: "cs-09", name: "Sashimi Kani", price: "R$ 35,90", unit: "9 fatias", subcategory: "Sashimis" },
      { id: "cs-10", name: "Sashimi Shiromi", price: "R$ 38,90", unit: "9 fatias", description: "Tilápia.", subcategory: "Sashimis" },
      { id: "cs-11", name: "Sashimi Tako", price: "R$ 54,00", unit: "9 fatias", description: "Polvo.", subcategory: "Sashimis" },
      { id: "cs-12", name: "Gari", price: "R$ 6,90", description: "Porção de gengibre." },
    ],
  },

  // ==========================================================================
  // 08. VARIADOS (clássicos, temakis, hossomakis, niguiris, gunkans, hots…)
  // ==========================================================================
  {
    id: "variados",
    number: "08",
    name: "Variados",
    description: "60 sushis · clássicos, temakis, niguiris, hots, califórnias",
    itemCount: "60 variados",
    detail: "todo o sushibar",
    gradient: "linear-gradient(135deg, #E2DBC4 0%, #D0C5A6 100%)",
    subcategories: [
      "Todos",
      "Clássicos",
      "Hossomakis",
      "Uramakis",
      "Niguiris",
      "Gunkans",
      "Hots",
      "Califórnias",
      "Temakis",
    ],
    dishes: [
      // Clássicos Kanpai (mesclados)
      { id: "cl-01", name: "Carpaccio de Salmão ao Molho Ponzu", price: "R$ 66,00", unit: "20 a 24 peças", description: "Fatias de salmão, molho ponzu e gergelim.", featured: true, subcategory: "Clássicos" },
      { id: "cl-02", name: "Carpaccio de Barriga de Salmão Trufado", price: "R$ 69,00", unit: "20 a 24 peças", description: "Finas fatias de barriga de salmão, azeite trufado, raspas de limão siciliano.", subcategory: "Clássicos" },
      { id: "cl-03", name: "Carpaccio de Peixe Branco Picante", price: "R$ 55,00", unit: "20 a 24 peças", description: "Finas fatias de tilápia, acrescido de limão e sriracha.", subcategory: "Clássicos" },
      { id: "cl-04", name: "Poke Kanpai", price: "R$ 64,00", description: "Cubos de salmão, atum, Saint Peter e abacate, crispy de couve, gohan e nori.", featured: true, subcategory: "Clássicos" },
      { id: "cl-05", name: "Ceviche de Saint Peter", price: "R$ 46,90", description: "Cubos de peixe branco e cebola roxa, coentro, marinados em molho de limão picante.", subcategory: "Clássicos" },
      { id: "cl-06", name: "Tataki", price: "R$ 46,90", description: "Atum, peixe branco e salmão marinado em molho shoyu picante.", subcategory: "Clássicos" },
      { id: "cl-07", name: "Salmão Maçaricado com Shimeji", price: "R$ 36,90", description: "Finas fatias de salmão com shimeji.", subcategory: "Clássicos" },
      { id: "cl-08", name: "Dyo Flambado com Camarão", price: "R$ 36,90", unit: "6 unidades", description: "Finas fatias de salmão envolto do shari, cream cheese e camarão.", subcategory: "Clássicos" },
      { id: "cl-09", name: "Sashimi Salmão com Azeite Trufado na Pedra de Sal", price: "R$ 37,90", description: "Finas fatias de salmão com azeite trufado na pedra de sal.", subcategory: "Clássicos" },
      { id: "cl-10", name: "Tartar Kanpai", price: "R$ 44,90", description: "Camadas de salmão, atum e peixe branco ao molho tarê.", subcategory: "Clássicos" },
      { id: "cl-11", name: "Salmão Roasted", price: "R$ 42,00", description: "Finas fatias de salmão selado com molho ponzu especial.", subcategory: "Clássicos" },
      { id: "cl-12", name: "Atum Roasted", price: "R$ 42,00", description: "Finas fatias de atum selado com molho ponzu especial.", subcategory: "Clássicos" },
      { id: "cl-13", name: "Lula com Massago", price: "R$ 52,90", description: "Anéis de lula levemente cozidos com ovas de arenque.", subcategory: "Clássicos" },
      { id: "cl-14", name: "Dragon", price: "R$ 38,90", description: "Enrolado com recheio de tempurá de camarão e sriracha, levemente picante.", subcategory: "Clássicos" },
      { id: "cl-15", name: "Uramaki Massago", price: "R$ 36,90", unit: "8 unidades", description: "Ovas de arenque por fora do arroz, recheio de salmão aquecido e cream cheese.", subcategory: "Clássicos" },
      { id: "cl-16", name: "Gunkan Ebi Furai", price: "R$ 38,90", unit: "4 unidades", description: "Camarão rosa empanado, envolto de peixe branco com cream cheese, finalizado com molho do chef e crispy de couve.", subcategory: "Clássicos" },
      { id: "cl-17", name: "Ceviche Nikkei", price: "R$ 62,90", description: "Cubos de tilápia, milho peruano, chips de batata-doce, cebolinha e molho especial da casa.", featured: true, subcategory: "Clássicos" },

      // Hossomakis
      { id: "va-01", name: "Hossomaki Filadelphia Roll", price: "R$ 34,90", description: "Alga por fora, recheio de salmão e cream cheese.", subcategory: "Hossomakis" },
      { id: "va-02", name: "Hossomaki Shakemaki", price: "R$ 33,00", description: "Alga por fora, recheado de salmão.", subcategory: "Hossomakis" },
      { id: "va-03", name: "Hossomaki Tekkamaki", price: "R$ 36,00", description: "Alga por fora, recheio de arroz e atum.", subcategory: "Hossomakis" },
      { id: "va-04", name: "Hossomaki Ebimaki", price: "R$ 38,00", unit: "8 unidades", description: "Alga por fora, recheio de camarão.", subcategory: "Hossomakis" },
      { id: "va-05", name: "Hossomaki Kanimaki", price: "R$ 29,00", description: "Alga por fora, recheio de kani.", subcategory: "Hossomakis" },
      { id: "va-06", name: "Hossomaki Tomate Seco", price: "R$ 32,90", description: "Alga por fora, recheio de tomate seco, rúcula e cream cheese.", subcategory: "Hossomakis", tags: ["Vegetariano"] },

      // Uramakis
      { id: "va-07", name: "Uramaki Filadelphia", price: "R$ 34,90", description: "Arroz e gergelim por fora, recheio de salmão e cream cheese.", subcategory: "Uramakis" },
      { id: "va-08", name: "Uramaki Skin Roll Especial", price: "R$ 29,90", description: "Recheio de salmão skin e cream cheese, enrolado com arroz por fora.", subcategory: "Uramakis" },
      { id: "va-09", name: "Uramaki Skin Roll", price: "R$ 28,00", description: "Recheio de salmão skin e molho tarê, enrolado com arroz por fora.", subcategory: "Uramakis" },

      // Niguiris
      { id: "va-10", name: "Niguiri Shake Salmão", price: "R$ 15,90", unit: "2 unidades", description: "Bolinho de arroz coberto com uma fatia de salmão.", subcategory: "Niguiris" },
      { id: "va-11", name: "Niguiri Salmão com Lâminas de Abacate", price: "R$ 24,90", subcategory: "Niguiris" },
      { id: "va-12", name: "Niguiri de Salmão Skin Especial", price: "R$ 28,90", unit: "6 unidades", description: "Niguiri de salmão skin, limão, cream cheese e cebolinha.", subcategory: "Niguiris" },
      { id: "va-13", name: "Niguiri Salmão Skin", price: "R$ 15,90", unit: "2 unidades", description: "Bolinho de arroz coberto com fatia de skin de salmão.", subcategory: "Niguiris" },
      { id: "va-14", name: "Niguiri Maguro", price: "R$ 15,90", unit: "2 fatias", description: "Bolinho de arroz coberto com fatia de atum.", subcategory: "Niguiris" },
      { id: "va-15", name: "Niguiri Ebi Camarão", price: "R$ 14,90", unit: "2 unidades", description: "Bolinho de arroz coberto com fatia de peixe.", subcategory: "Niguiris" },
      { id: "va-16", name: "Niguiri Shiromi", price: "R$ 15,90", unit: "2 unidades", description: "Bolinho de arroz coberto com fatia de peixe branco.", subcategory: "Niguiris" },
      { id: "va-17", name: "Niguiri Tako", price: "R$ 22,90", unit: "2 unidades", description: "Bolinho de arroz coberto com fatia de polvo.", subcategory: "Niguiris" },
      { id: "va-18", name: "Niguiri Kani", price: "R$ 12,90", unit: "2 unidades", description: "Bolinho de arroz coberto com fatia de peixe.", subcategory: "Niguiris" },

      // Gunkans
      { id: "va-19", name: "Gunkans Shake", price: "R$ 38,90", unit: "6 unidades", description: "Bolinho de arroz envolto com salmão, recheio de salmão batidinho.", subcategory: "Gunkans" },
      { id: "va-20", name: "Gunkans Tasty", price: "R$ 38,90", unit: "6 unidades", description: "Salmão envolto no cream cheese.", subcategory: "Gunkans" },
      { id: "va-21", name: "Gunkans Morango", price: "R$ 40,90", unit: "6 unidades", description: "Salmão e recheio de cream cheese, morango e mel.", subcategory: "Gunkans" },
      { id: "va-22", name: "Gunkans Maguro", price: "R$ 38,90", unit: "6 unidades", description: "Bolinho de arroz envolto com atum, recheio de atum batidinho.", subcategory: "Gunkans" },
      { id: "va-23", name: "Gunkans Shakemeji", price: "R$ 42,90", unit: "6 unidades", description: "Bolinho de arroz envolto com salmão, recheio de shimeji.", subcategory: "Gunkans" },
      { id: "va-24", name: "Gunkan Vegetariano", price: "R$ 36,90", unit: "1 unidade", description: "Bolinho de arroz envolto com pepino, recheio de shimeji.", subcategory: "Gunkans", tags: ["Vegetariano"] },

      // Hots
      { id: "va-25", name: "Hot Filadelphia", price: "R$ 42,90", unit: "10 unidades", description: "Empanado com alga, recheio de arroz, salmão e cream cheese levemente derretido.", subcategory: "Hots" },
      { id: "va-26", name: "Hot Mix", price: "R$ 42,90", unit: "8 unidades", description: "Empanado com alga, recheio de peixe branco, salmão e cream cheese.", subcategory: "Hots" },
      { id: "va-27", name: "Hot Shake", price: "R$ 44,90", unit: "8 unidades", description: "Empanado de salmão com recheio de camarão e cream cheese levemente derretido.", subcategory: "Hots" },
      { id: "va-28", name: "Salmão Tempurado", price: "R$ 44,90", unit: "8 unidades", description: "Empanado de salmão com recheio de camarão, kani, ovas e cream cheese.", subcategory: "Hots" },

      // Califórnias
      { id: "va-29", name: "Califórnia Roll", price: "R$ 28,90", unit: "8 unidades", description: "Recheio de kani, manga e pepino, enrolado com arroz por fora.", subcategory: "Califórnias" },
      { id: "va-30", name: "Futomaki Vegetariano", price: "R$ 32,90", unit: "1 unidade", description: "Alga por fora, recheio de arroz, tomate seco, alface, pepino, cenoura e manga.", subcategory: "Califórnias", tags: ["Vegetariano"] },
      { id: "va-31", name: "Kyurimaki de Shimeji", price: "R$ 36,90", unit: "1 unidade", description: "Enrolado de pepino com recheio de cream cheese e shimeji.", subcategory: "Califórnias", tags: ["Vegetariano"] },
      { id: "va-32", name: "Kyurimaki de Tomate Seco", price: "R$ 36,90", unit: "1 unidade", description: "Enrolado de pepino e arroz, tomate seco, rúcula e cream cheese.", subcategory: "Califórnias", tags: ["Vegetariano"] },

      // Temakis (mesclados)
      { id: "tk-01", name: "Temakis sem Arroz com Peixe", price: "R$ 42,90", description: "Enrolado de alga recheado com peixe à sua escolha: atum, salmão ou peixe branco.", subcategory: "Temakis" },
      { id: "tk-02", name: "Temaki Salmão", price: "R$ 36,90", unit: "1 unidade", description: "Enrolado de alga e arroz em formato de cone com recheio de salmão e cebolinha.", featured: true, subcategory: "Temakis" },
      { id: "tk-03", name: "Temaki Hot Roll", price: "R$ 42,00", unit: "1 unidade", description: "Enrolado de alga e arroz empanado em formato de cone com recheio de salmão e cream cheese.", subcategory: "Temakis" },
      { id: "tk-04", name: "Temaki Salmão Especial", price: "R$ 38,00", description: "Enrolado de alga e arroz com recheio de salmão, cream cheese e cebolinha.", subcategory: "Temakis" },
      { id: "tk-05", name: "Temaki Shiromi", price: "R$ 35,00", unit: "1 unidade", description: "Enrolado com recheio de peixe branco, cebolinha e raspas de limão siciliano.", subcategory: "Temakis" },
      { id: "tk-06", name: "Temaki Takô", price: "R$ 42,00", unit: "1 unidade", description: "Recheio de polvo e cebolinha.", subcategory: "Temakis" },
      { id: "tk-07", name: "Temaki Salmão Skin", price: "R$ 35,00", unit: "1 unidade", description: "Recheio de salmão skin, salmão e cebolinha.", subcategory: "Temakis" },
      { id: "tk-08", name: "Temaki Ebi Empanado", price: "R$ 39,00", description: "Recheio de camarão empanado, cream cheese e cebolinha.", subcategory: "Temakis" },
      { id: "tk-09", name: "Temaki Califórnia", price: "R$ 29,90", unit: "1 unidade", description: "Recheio de kani, manga e pepino.", subcategory: "Temakis" },
      { id: "tk-10", name: "Temaki Vegetariano", price: "R$ 29,90", unit: "1 unidade", description: "Recheio de shimeji, pepino, manga e cebolinha.", subcategory: "Temakis", tags: ["Vegetariano"] },
      { id: "tk-11", name: "Temaki Maguro", price: "R$ 37,00", description: "Recheio de atum e cebolinha.", subcategory: "Temakis" },
    ],
  },

  // ==========================================================================
  // 09. PRATOS QUENTES (Risotos, Teppanyaki, Yakissoba, Tempurás)
  // ==========================================================================
  {
    id: "pratos-quentes",
    number: "09",
    name: "Pratos Quentes",
    description: "18 pratos · risotos, teppanyakis, yakissobas",
    itemCount: "18 pratos",
    detail: "wok, chapa, forno",
    gradient: "linear-gradient(135deg, #C8BFA0 0%, #A89878 100%)",
    subcategories: ["Todos", "Risotos", "Teppanyaki", "Yakissoba", "Tempurás"],
    dishes: [
      { id: "qt-01", name: "Filé Mignon com Risoto de Bacon", price: "R$ 84,90", description: "Filé mignon com risoto de bacon.", subcategory: "Risotos", featured: true },
      { id: "qt-02", name: "Risoto Oriental de Camarão", price: "R$ 89,90", description: "Risoto de alho-poró com raspa de limão siciliano e finalizado com camarão.", subcategory: "Risotos" },
      { id: "qt-03", name: "Robalo Oriental", price: "R$ 89,90", description: "Risoto de shimeji feito com arroz japonês finalizado com robalo grelhado.", subcategory: "Risotos" },
      { id: "qt-04", name: "Filé com Risoto de Cogumelos", price: "R$ 84,90", description: "Filé mignon com farofa de ervas, risoto de parmesão e brócolis tostados.", subcategory: "Risotos", featured: true },
      { id: "qt-05", name: "Tempurá Misto", price: "R$ 89,90", description: "Legumes, lichia e camarão.", subcategory: "Tempurás" },
      { id: "qt-06", name: "Tempurá Camarão", price: "R$ 98,90", description: "Empanados levíssimos e transparentes.", subcategory: "Tempurás" },
      { id: "qt-07", name: "Tempurá de Legumes", price: "R$ 44,90", description: "Empanados levíssimos e transparentes.", subcategory: "Tempurás", tags: ["Vegetariano"] },
      { id: "qt-08", name: "Teppanyaki Camarão", price: "R$ 99,90", description: "Grelhados na chapa com sabor especial. Acompanha legumes.", subcategory: "Teppanyaki" },
      { id: "qt-09", name: "Teppanyaki de Filé Mignon", price: "R$ 96,90", description: "Grelhados na chapa com sabor especial. Acompanha legumes.", subcategory: "Teppanyaki" },
      { id: "qt-10", name: "Teppanyaki de Frango", price: "R$ 79,90", description: "Grelhados na chapa com sabor especial. Acompanha legumes.", subcategory: "Teppanyaki" },
      { id: "qt-11", name: "Teppanyaki Kanpai", price: "R$ 99,90", description: "Camarão, lula e polvo. Grelhados na chapa com sabor especial. Acompanha legumes.", subcategory: "Teppanyaki", featured: true },
      { id: "qt-12", name: "Teppanyaki de Robalo", price: "R$ 97,90", description: "Grelhados na chapa com sabor especial. Acompanha legumes.", subcategory: "Teppanyaki" },
      { id: "qt-13", name: "Teppanyaki de Salmão", price: "R$ 96,90", description: "Grelhados na chapa com sabor especial. Acompanha legumes.", subcategory: "Teppanyaki" },
      { id: "qt-14", name: "Yakissoba de Camarão", price: "R$ 65,90", description: "Macarrão japonês cozido e depois frito na manteiga com legumes.", subcategory: "Yakissoba" },
      { id: "qt-15", name: "Yakissoba de Filé Mignon", price: "R$ 59,90", description: "Macarrão japonês cozido e depois frito na manteiga com legumes.", subcategory: "Yakissoba" },
      { id: "qt-16", name: "Yakissoba de Frango", price: "R$ 54,90", description: "Macarrão japonês cozido e depois frito na manteiga com legumes.", subcategory: "Yakissoba" },
      { id: "qt-17", name: "Yakissoba Kanpai", price: "R$ 69,90", description: "Camarão, lula e polvo. Macarrão japonês com legumes.", subcategory: "Yakissoba", featured: true },
      { id: "qt-18", name: "Yakissoba Vegetariano", price: "R$ 39,90", description: "Legumes.", subcategory: "Yakissoba", tags: ["Vegetariano"] },
    ],
  },

  // ==========================================================================
  // 10. SOBREMESAS (placeholder · conteúdo a definir)
  // ==========================================================================
  {
    id: "sobremesas",
    number: "10",
    name: "Sobremesas",
    description: "em breve · doces da casa",
    itemCount: "em breve",
    detail: "doces e finalizações",
    gradient: "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)",
    dishes: [],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.id === slug);
}
