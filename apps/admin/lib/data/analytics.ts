import { createServerClient } from "@/lib/supabase-server";
import type { Range } from "./analytics-shared";

export { RANGE_LABELS, RANGE_ORDER, type Range } from "./analytics-shared";

export type RangeWindow = {
  start: string | null; // ISO; null = sem limite inicial
  end: string;          // ISO (now)
  prevStart: string | null;
  prevEnd: string | null;
};

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const BRASILIA_TZ = "America/Sao_Paulo";
const HOUR_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: BRASILIA_TZ,
  hour: "2-digit",
  hour12: false,
});

function hourInBrasilia(iso: string): number {
  const parts = HOUR_FMT.formatToParts(new Date(iso));
  const h = parts.find((p) => p.type === "hour")?.value ?? "0";
  const n = Number.parseInt(h, 10);
  return Number.isFinite(n) ? n % 24 : 0;
}

// en-CA formata como YYYY-MM-DD; com timeZone obtemos a data civil de Brasília.
const DAY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: BRASILIA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de hoje no fuso de Brasília, formato YYYY-MM-DD. */
export function brasiliaToday(): string {
  return DAY_FMT.format(new Date());
}

/**
 * Janela UTC de um dia civil de Brasília (YYYY-MM-DD).
 * Brasília é UTC−3 fixo (sem horário de verão desde 2019).
 */
function dayWindowBrasilia(dayISO: string): { start: string; end: string } {
  const start = new Date(`${dayISO}T00:00:00-03:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Data civil de Brasília (YYYY-MM-DD) de um instante ISO. */
function brasiliaDay(iso: string): string {
  return DAY_FMT.format(new Date(iso));
}

export function rangeWindow(r: Range): RangeWindow {
  const nowIso = new Date().toISOString();
  // Meia-noite de Brasília de hoje (não do fuso do servidor, que é UTC na Vercel).
  const todayStartIso = dayWindowBrasilia(brasiliaToday()).start;
  const todayStartMs = new Date(todayStartIso).getTime();
  const DAY = 24 * 60 * 60 * 1000;

  if (r === "today") {
    return {
      start: todayStartIso,
      end: nowIso,
      prevStart: new Date(todayStartMs - DAY).toISOString(),
      prevEnd: todayStartIso,
    };
  }
  if (r === "yesterday") {
    const yStart = new Date(todayStartMs - DAY).toISOString();
    return {
      start: yStart,
      end: todayStartIso,
      prevStart: new Date(todayStartMs - 2 * DAY).toISOString(),
      prevEnd: yStart,
    };
  }
  const days = r === "7d" ? 7 : r === "30d" ? 30 : r === "90d" ? 90 : 0;
  if (days === 0) {
    return { start: null, end: nowIso, prevStart: null, prevEnd: null };
  }
  const start = isoDaysAgo(days);
  const prevStart = isoDaysAgo(days * 2);
  return { start, end: nowIso, prevStart, prevEnd: start };
}

export type EventRow = {
  visitor_id: string;
  session_id: string;
  event_type: "home_view" | "category_open" | "dish_view" | "dish_impression";
  category_id: string | null;
  dish_slug: string | null;
  created_at: string;
};

async function fetchEvents(
  restaurantId: string,
  start: string | null,
  end: string,
  /** Slug da categoria (mesmo valor gravado pelo site em category_open). */
  categorySlug?: string
): Promise<EventRow[]> {
  const supabase = createServerClient();
  let q = supabase
    .from("analytics_events")
    .select("visitor_id, session_id, event_type, category_id, dish_slug, created_at")
    .eq("restaurant_id", restaurantId)
    .eq("is_internal", false)
    // qr_scan é métrica do QR (IDs sintéticos) — não entra nas contagens do dashboard
    .neq("event_type", "qr_scan")
    .lt("created_at", end);
  if (start) q = q.gte("created_at", start);
  if (categorySlug) q = q.eq("category_id", categorySlug);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(50000);
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export type Stats = {
  visitors: number;
  sessions: number;
  views: number;             // todos os "_view" + impressions agregados
  itemsPerVisit: number;     // dish_impression por sessão
  engagementRate: number;    // % sessões com pelo menos 1 dish_impression
  homeViews: number;
  categoryOpens: number;
  dishImpressions: number;
  dishViews: number;
  // Funil em PESSOAS únicas (não eventos) — para % sempre <= 100%.
  peopleOpenedCategory: number;
  peopleSawDishes: number;
};

/**
 * Sessões "úteis": tiveram >= 2 eventos OU duração >= 3s.
 * Filtra reloads/testes rápidos da equipe que inflam o total de acessos.
 */
const MIN_USEFUL_EVENTS = 2;
const MIN_USEFUL_DURATION_MS = 3000;

function selectUsefulSessions(events: EventRow[]): Set<string> {
  const bySession = new Map<string, { count: number; min: number; max: number }>();
  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    const cur = bySession.get(e.session_id);
    if (!cur) bySession.set(e.session_id, { count: 1, min: t, max: t });
    else {
      cur.count += 1;
      if (t < cur.min) cur.min = t;
      if (t > cur.max) cur.max = t;
    }
  }
  const useful = new Set<string>();
  for (const [sid, info] of bySession) {
    if (info.count >= MIN_USEFUL_EVENTS || info.max - info.min >= MIN_USEFUL_DURATION_MS) {
      useful.add(sid);
    }
  }
  return useful;
}

function computeStats(events: EventRow[]): Stats {
  const usefulSessions = selectUsefulSessions(events);

  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const sessionsWithDish = new Set<string>();
  const peopleCategory = new Set<string>();
  const peopleDishes = new Set<string>();
  let homeViews = 0;
  let categoryOpens = 0;
  let dishImpressions = 0;
  let dishViews = 0;
  for (const e of events) {
    // home_views de sessões não-úteis (reload rapido sem interação) são descartados.
    // Outros eventos sempre contam — se houve clique/impressão, a sessão já é útil.
    if (e.event_type === "home_view" && !usefulSessions.has(e.session_id)) continue;

    visitors.add(e.visitor_id);
    sessions.add(e.session_id);
    if (e.event_type === "home_view") homeViews += 1;
    else if (e.event_type === "category_open") {
      categoryOpens += 1;
      peopleCategory.add(e.visitor_id);
    } else if (e.event_type === "dish_impression") {
      dishImpressions += 1;
      sessionsWithDish.add(e.session_id);
      peopleDishes.add(e.visitor_id);
    } else if (e.event_type === "dish_view") {
      dishViews += 1;
      sessionsWithDish.add(e.session_id);
    }
  }
  const totalSessions = sessions.size;
  return {
    visitors: visitors.size,
    sessions: totalSessions,
    views: homeViews + categoryOpens + dishImpressions + dishViews,
    itemsPerVisit:
      totalSessions === 0 ? 0 : (dishImpressions + dishViews) / totalSessions,
    engagementRate: totalSessions === 0 ? 0 : sessionsWithDish.size / totalSessions,
    homeViews,
    categoryOpens,
    dishImpressions,
    dishViews,
    peopleOpenedCategory: peopleCategory.size,
    peopleSawDishes: peopleDishes.size,
  };
}

export type Insights = {
  topCategory: { id: string; count: number; people: number } | null;
  topDishImpression: { slug: string; count: number; people: number } | null;
  topDishView: { slug: string; count: number; people: number } | null;
  peakHour: { hour: number; count: number } | null;
};

function computeInsights(events: EventRow[]): Insights {
  const catCount = new Map<string, { count: number; people: Set<string> }>();
  const impressionCount = new Map<string, { count: number; people: Set<string> }>();
  const viewCount = new Map<string, { count: number; people: Set<string> }>();
  const hourCount = new Array<number>(24).fill(0);

  for (const e of events) {
    if (e.event_type === "category_open" && e.category_id) {
      const r = catCount.get(e.category_id) ?? { count: 0, people: new Set() };
      r.count += 1;
      r.people.add(e.visitor_id);
      catCount.set(e.category_id, r);
    } else if (e.event_type === "dish_impression" && e.dish_slug) {
      const r = impressionCount.get(e.dish_slug) ?? { count: 0, people: new Set() };
      r.count += 1;
      r.people.add(e.visitor_id);
      impressionCount.set(e.dish_slug, r);
    } else if (e.event_type === "dish_view" && e.dish_slug) {
      const r = viewCount.get(e.dish_slug) ?? { count: 0, people: new Set() };
      r.count += 1;
      r.people.add(e.visitor_id);
      viewCount.set(e.dish_slug, r);
    }
    hourCount[hourInBrasilia(e.created_at)] += 1;
  }

  function topOf(m: Map<string, { count: number; people: Set<string> }>) {
    let best: { key: string; count: number; people: number } | null = null;
    for (const [k, v] of m) {
      if (!best || v.count > best.count) best = { key: k, count: v.count, people: v.people.size };
    }
    return best;
  }

  const topCat = topOf(catCount);
  const topImp = topOf(impressionCount);
  const topV = topOf(viewCount);
  let peakHour: { hour: number; count: number } | null = null;
  hourCount.forEach((c, h) => {
    if (c > 0 && (!peakHour || c > peakHour.count)) peakHour = { hour: h, count: c };
  });

  return {
    topCategory: topCat ? { id: topCat.key, count: topCat.count, people: topCat.people } : null,
    topDishImpression: topImp ? { slug: topImp.key, count: topImp.count, people: topImp.people } : null,
    topDishView: topV ? { slug: topV.key, count: topV.count, people: topV.people } : null,
    peakHour,
  };
}

export type SeriesPoint = { day: string; visits: number; uniques: number };

function computeDaySeries(events: EventRow[], range: RangeWindow): SeriesPoint[] {
  const byDay = new Map<string, { visits: number; uniques: Set<string> }>();
  for (const e of events) {
    const day = brasiliaDay(e.created_at); // dia civil de Brasília, não UTC
    const b = byDay.get(day) ?? { visits: 0, uniques: new Set() };
    if (e.event_type === "home_view") b.visits += 1;
    b.uniques.add(e.visitor_id);
    byDay.set(day, b);
  }
  const points: SeriesPoint[] = [];
  // Constrói série contígua (dia a dia de Brasília) se houver janela limitada
  if (range.start) {
    const DAY = 24 * 60 * 60 * 1000;
    // Alinha o cursor à meia-noite de Brasília do primeiro dia da janela.
    let cursorMs = new Date(`${brasiliaDay(range.start)}T00:00:00-03:00`).getTime();
    const endMs = new Date(`${brasiliaDay(range.end)}T00:00:00-03:00`).getTime();
    while (cursorMs <= endMs) {
      const day = brasiliaDay(new Date(cursorMs).toISOString());
      const b = byDay.get(day);
      points.push({ day, visits: b?.visits ?? 0, uniques: b?.uniques.size ?? 0 });
      cursorMs += DAY;
    }
  } else {
    // sem limite — ordena tudo cronologicamente
    const days = [...byDay.keys()].sort();
    for (const day of days) {
      const b = byDay.get(day)!;
      points.push({ day, visits: b.visits, uniques: b.uniques.size });
    }
  }
  return points;
}

function computeHourHistogram(events: EventRow[]): number[] {
  const h = new Array<number>(24).fill(0);
  for (const e of events) {
    h[hourInBrasilia(e.created_at)] += 1;
  }
  return h;
}

export type CategoryRank = { id: string; name: string; clicks: number; people: number };
export type DishRank = { slug: string; name: string; impressions: number; views: number; people: number };

async function loadNames(restaurantId: string) {
  const supabase = createServerClient();
  const [catsRes, dishesRes] = await Promise.all([
    supabase.from("categories").select("id, slug, name").eq("restaurant_id", restaurantId),
    supabase.from("dishes").select("id, slug, name").eq("restaurant_id", restaurantId),
  ]);
  const cats = new Map<string, string>();
  for (const c of catsRes.data ?? []) {
    cats.set(c.slug, c.name);
    cats.set(c.id, c.name);
  }
  const dishes = new Map<string, string>();
  for (const d of dishesRes.data ?? []) {
    dishes.set(d.slug, d.name);
    dishes.set(d.id, d.name);
  }
  return { cats, dishes };
}

function computeTopCategories(events: EventRow[], catNames: Map<string, string>): CategoryRank[] {
  const m = new Map<string, { clicks: number; people: Set<string> }>();
  for (const e of events) {
    if (e.event_type !== "category_open" || !e.category_id) continue;
    const r = m.get(e.category_id) ?? { clicks: 0, people: new Set() };
    r.clicks += 1;
    r.people.add(e.visitor_id);
    m.set(e.category_id, r);
  }
  return [...m.entries()]
    .map(([id, v]) => ({ id, name: catNames.get(id) ?? id, clicks: v.clicks, people: v.people.size }))
    .sort((a, b) => b.clicks - a.clicks);
}

function computeTopDishes(events: EventRow[], dishNames: Map<string, string>): DishRank[] {
  const m = new Map<string, { impressions: number; views: number; people: Set<string> }>();
  for (const e of events) {
    if (!e.dish_slug) continue;
    if (e.event_type !== "dish_impression" && e.event_type !== "dish_view") continue;
    const r = m.get(e.dish_slug) ?? { impressions: 0, views: 0, people: new Set() };
    if (e.event_type === "dish_impression") r.impressions += 1;
    if (e.event_type === "dish_view") r.views += 1;
    r.people.add(e.visitor_id);
    m.set(e.dish_slug, r);
  }
  return [...m.entries()]
    .map(([slug, v]) => ({
      slug,
      name: dishNames.get(slug) ?? slug,
      impressions: v.impressions,
      views: v.views,
      people: v.people.size,
    }))
    // Ordena por pessoas distintas; desempate por impressões.
    // Evita "Água com Gás" no topo só por estar no início da lista.
    .sort((a, b) => b.people - a.people || b.impressions - a.impressions);
}

export type DashboardData = {
  range: Range;
  window: RangeWindow;
  stats: Stats;
  prevStats: Stats | null;
  insights: Insights;
  daySeries: SeriesPoint[];
  hourHistogram: number[];
  topCategories: CategoryRank[];
  topDishes: DishRank[];
};

export async function loadDashboard(
  range: Range,
  restaurantId: string,
  categorySlug?: string
): Promise<DashboardData> {
  const window = rangeWindow(range);
  const [events, names] = await Promise.all([
    fetchEvents(restaurantId, window.start, window.end, categorySlug),
    loadNames(restaurantId),
  ]);

  const stats = computeStats(events);
  const insights = computeInsights(events);
  const daySeries = computeDaySeries(events, window);
  const hourHistogram = computeHourHistogram(events);
  const topCategories = computeTopCategories(events, names.cats);
  const topDishes = computeTopDishes(events, names.dishes);

  let prevStats: Stats | null = null;
  if (window.prevStart && window.prevEnd) {
    const prev = await fetchEvents(restaurantId, window.prevStart, window.prevEnd, categorySlug);
    prevStats = computeStats(prev);
  }

  return {
    range,
    window,
    stats,
    prevStats,
    insights,
    daySeries,
    hourHistogram,
    topCategories,
    topDishes,
  };
}

/**
 * Histograma de acessos por hora de UM dia civil de Brasília.
 * Independente da janela do dashboard — busca só os eventos do dia pedido.
 */
export async function loadHourHistogram(
  restaurantId: string,
  dayISO: string,
  categorySlug?: string
): Promise<number[]> {
  const { start, end } = dayWindowBrasilia(dayISO);
  const events = await fetchEvents(restaurantId, start, end, categorySlug);
  return computeHourHistogram(events);
}

export async function loadCategoryOptions(restaurantId: string): Promise<{ slug: string; name: string; id: string }[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("restaurant_id", restaurantId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}
