/** Paleta dos gráficos Tremor / Recharts alinhada ao brand Kanpai Blue */
export const CHART_PRIMARY = "#2d4ae8";
export const CHART_SECONDARY = "#6b8af7";
export const CHART_TERTIARY = "#1a0e6e";
export const CHART_ACCENT = "#4f6ef0";
export const CHART_LIGHT = "#93a8fb";
export const CHART_MUTED = "#c8c5dc";

export const CHART_SERIES_TWO = [CHART_PRIMARY, CHART_SECONDARY] as const;

export const CHART_SERIES_ONE = [CHART_PRIMARY] as const;

export const CHART_DONUT = [
  CHART_PRIMARY,
  CHART_ACCENT,
  CHART_SECONDARY,
  CHART_LIGHT,
  "#7c78a8",
  CHART_TERTIARY,
  "#b8c8fc",
  CHART_MUTED,
] as const;

/** Uma cor por barra no top 10 de pratos */
export const CHART_BAR_TOP10 = [
  CHART_PRIMARY,
  CHART_ACCENT,
  CHART_SECONDARY,
  CHART_LIGHT,
  "#5a7ef5",
  "#7c78a8",
  CHART_TERTIARY,
  "#a5b8fc",
  "#4a4580",
  CHART_MUTED,
] as const;
