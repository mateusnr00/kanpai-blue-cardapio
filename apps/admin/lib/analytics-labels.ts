/** Textos do painel Analytics — linguagem clara para o time do restaurante. */

export const ANALYTICS_PAGE = {
  title: "Analytics",
  description:
    "O que os clientes fazem no cardápio digital no site. Os números vêm de acessos reais ao menu público da unidade selecionada.",
  emptyHint:
    "Ainda não há dados neste período. Abra o cardápio no celular ou peça para alguém navegar no site, em alguns segundos os números aparecem aqui.",
} as const;

export const STAT_LABELS = {
  visitors: {
    label: "Visitantes únicos",
    hint: "Pessoas diferentes que abriram o cardápio. O mesmo aparelho conta uma vez por período.",
  },
  homeViews: {
    label: "Total de acessos",
    hint: "Vezes que a tela inicial foi carregada. Reloads rápidos sem interação (testes da equipe, bots) são descartados.",
  },
  dishTouches: {
    label: "Pratos exibidos ao rolar",
    hint: "Quantas vezes algum prato apareceu na lista ao rolar a tela. Conta cada aparição.",
  },
  dishDetails: {
    label: "Cliques em \"ver mais\"",
    hint: "Quantas vezes alguém abriu a ficha completa de um prato para ler detalhes ou preço.",
  },
  engagement: {
    label: "Chegaram a ver pratos",
    hint: "De cada 100 visitas, quantas chegaram a ver ao menos um prato na lista. Mede a saúde do cardápio.",
  },
  depth: {
    label: "Pratos por visita",
    hint: "Em média, quantos pratos cada visita viu, somando rolagem e detalhes abertos.",
  },
} as const;

export const CHART_LABELS = {
  daySeries: {
    title: "Movimento por dia",
    description: "Acessos ao cardápio e visitantes únicos por dia",
    home: "Total de acessos",
    uniques: "Visitantes únicos",
    empty: "Sem acessos neste período.",
  },
  hours: {
    title: "Horário do dia",
    description: "Quando o cardápio é mais acessado (horário de Brasília)",
    empty: "Sem acessos neste período.",
  },
  categories: {
    title: "Categorias mais abertas",
    description: "Seções do menu que as pessoas entraram para ver os pratos",
    empty: "Ninguém abriu uma categoria neste período.",
    center: "aberturas",
  },
  dishes: {
    title: "Pratos que mais chamaram atenção",
    description: "Pratos vistos por mais pessoas diferentes ao rolar o cardápio",
    empty: "Nenhum prato foi exibido na lista neste período.",
    seeMore: (total: number) => `Ver lista completa (${total} itens)`,
    modalTitle: "Todos os pratos exibidos",
    modalDescription: (total: number) =>
      `${total} itens no período, ordenados por número de pessoas diferentes que viram`,
  },
  insights: {
    title: "Destaques do período",
    description: "Resumo rápido do que mais aconteceu no cardápio",
  },
} as const;
