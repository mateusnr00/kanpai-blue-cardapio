/** Textos do painel Analytics — linguagem clara para o time do restaurante. */

export const ANALYTICS_PAGE = {
  title: "Analytics",
  description:
    "O que os clientes fazem no cardápio digital no site. Os números vêm de acessos reais ao menu público da unidade selecionada.",
  emptyHint:
    "Ainda não há dados neste período. Abra o cardápio no celular ou peça para alguém navegar no site — em alguns segundos os números aparecem aqui.",
} as const;

export const STAT_LABELS = {
  visitors: {
    label: "Pessoas diferentes",
    hint: "Quantos visitantes únicos abriram o cardápio (mesmo aparelho conta uma vez no período).",
  },
  homeViews: {
    label: "Aberturas do cardápio",
    hint: "Quantas vezes a tela inicial do restaurante foi carregada.",
  },
  dishTouches: {
    label: "Pratos na tela",
    hint: "Vezes que um prato apareceu na lista ao rolar (cada aparição conta).",
  },
  dishDetails: {
    label: "Detalhes abertos",
    hint: 'Cliques em "ver itens" ou abertura da ficha completa do prato.',
  },
  engagement: {
    label: "Viram algum prato",
    hint: "Porcentagem das visitas em que a pessoa chegou a ver pelo menos um item na lista.",
  },
  depth: {
    label: "Pratos por visita",
    hint: "Em média, quantas aparições de pratos cada visita gerou (rolagem + detalhes).",
  },
} as const;

export const CHART_LABELS = {
  daySeries: {
    title: "Movimento por dia",
    description: "Aberturas do cardápio e pessoas diferentes por dia",
    home: "Aberturas do cardápio",
    uniques: "Pessoas diferentes",
    empty: "Sem acessos neste período.",
  },
  hours: {
    title: "Horário do dia",
    description: "Quando o cardápio é mais acessado (horário do servidor)",
    empty: "Sem acessos neste período.",
  },
  categories: {
    title: "Categorias mais abertas",
    description: "Seções do menu que as pessoas entraram para ver os pratos",
    empty: "Ninguém abriu uma categoria neste período.",
    center: "aberturas",
  },
  dishes: {
    title: "Pratos que mais apareceram",
    description: "Itens que mais surgiram na tela ao rolar as listas",
    empty: "Nenhum prato foi exibido na lista neste período.",
    seeMore: (total: number) => `Ver lista completa (${total} itens)`,
    modalTitle: "Todos os pratos exibidos",
    modalDescription: (total: number) =>
      `${total} itens no período · ordenados por quantas vezes apareceram na tela`,
  },
  insights: {
    title: "Destaques do período",
    description: "Resumo rápido do que mais aconteceu no cardápio",
  },
} as const;
