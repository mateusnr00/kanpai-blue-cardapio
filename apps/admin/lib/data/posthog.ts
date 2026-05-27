/**
 * Cliente server-side da PostHog Query API (HogQL).
 *
 * Token vive em POSTHOG_API_KEY (sem NEXT_PUBLIC_) — só no servidor.
 * Project ID numerico vive em POSTHOG_PROJECT_ID. Diferente do project
 * token alfanumerico usado pelo iframe/links externos.
 *
 * Documentacao: https://posthog.com/docs/api/query
 */

const API_KEY = process.env.POSTHOG_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const HOST = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";

export function isPostHogApiConfigured(): boolean {
  return !!API_KEY && !!PROJECT_ID;
}

type HogQLResponse = {
  results: unknown[][];
  columns?: string[];
  types?: string[];
};

async function hogQL(query: string): Promise<HogQLResponse> {
  if (!API_KEY || !PROJECT_ID) {
    throw new Error("PostHog API nao configurada");
  }
  const res = await fetch(`${HOST}/api/projects/${PROJECT_ID}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query },
    }),
    // Revalida a cada 5min — evita martelar API a cada navegacao.
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PostHog API ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as HogQLResponse;
}

function firstRowFirstCol(r: HogQLResponse): number {
  const v = r.results?.[0]?.[0];
  return typeof v === "number" ? v : 0;
}

export type PostHogKpis = {
  visitors30d: number;
  pageviews30d: number;
  visitors7d: number;
  pageviews7d: number;
};

export async function loadPostHogKpis(): Promise<PostHogKpis> {
  const [v30, p30, v7, p7] = await Promise.all([
    hogQL(
      `SELECT count(DISTINCT distinct_id) FROM events
       WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY`,
    ),
    hogQL(
      `SELECT count() FROM events
       WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY`,
    ),
    hogQL(
      `SELECT count(DISTINCT distinct_id) FROM events
       WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY`,
    ),
    hogQL(
      `SELECT count() FROM events
       WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY`,
    ),
  ]);
  return {
    visitors30d: firstRowFirstCol(v30),
    pageviews30d: firstRowFirstCol(p30),
    visitors7d: firstRowFirstCol(v7),
    pageviews7d: firstRowFirstCol(p7),
  };
}

export type PostHogDailyPoint = { day: string; pageviews: number; visitors: number };

export async function loadPostHogDailySeries(): Promise<PostHogDailyPoint[]> {
  const r = await hogQL(
    `SELECT
       toDate(timestamp) AS day,
       count() AS pageviews,
       count(DISTINCT distinct_id) AS visitors
     FROM events
     WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
     GROUP BY day
     ORDER BY day`,
  );
  return (r.results ?? []).map((row) => ({
    day: String(row[0]),
    pageviews: Number(row[1] ?? 0),
    visitors: Number(row[2] ?? 0),
  }));
}

export type PostHogTopPage = { path: string; views: number };

export async function loadPostHogTopPages(limit = 8): Promise<PostHogTopPage[]> {
  const r = await hogQL(
    `SELECT properties.$pathname AS path, count() AS views
     FROM events
     WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
       AND properties.$pathname IS NOT NULL
     GROUP BY path
     ORDER BY views DESC
     LIMIT ${Math.max(1, Math.min(50, Math.trunc(limit)))}`,
  );
  return (r.results ?? []).map((row) => ({
    path: String(row[0] ?? "/"),
    views: Number(row[1] ?? 0),
  }));
}
