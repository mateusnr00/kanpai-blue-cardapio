# Admin Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top navbar with a sidebar + bottom nav, migrate analytics charts to Tremor, and add styled filter dropdowns.

**Architecture:** Server-rendered sidebar on desktop with client-side bottom nav on mobile. Tremor chart components replace custom SVG charts. Filters use searchParams for server-side filtering (no client state). Executivos becomes a tab in the Cardápio page via searchParams.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS 3.4, @tremor/react, Phosphor Icons, Supabase

---

## File Structure

### New files
- `apps/admin/components/AdminSidebar.tsx` — server component, desktop sidebar (240px fixed)
- `apps/admin/components/BottomNav.tsx` — client component, mobile bottom navigation
- `apps/admin/components/MobileTopBar.tsx` — client component, mobile top bar with hamburger for extras
- `apps/admin/components/analytics/VisitsAreaChart.tsx` — Tremor AreaChart wrapper
- `apps/admin/components/analytics/HourBarChart.tsx` — Tremor BarChart wrapper
- `apps/admin/components/analytics/CategoriesDonutChart.tsx` — Tremor DonutChart wrapper
- `apps/admin/components/analytics/DishesBarList.tsx` — Tremor BarList wrapper
- `apps/admin/components/analytics/AnalyticsFilters.tsx` — server component, pill dropdowns

### Modified files
- `apps/admin/app/(protected)/layout.tsx` — flex-row with sidebar + bottom nav
- `apps/admin/app/(protected)/analytics/page.tsx` — new layout with Tremor charts + filters
- `apps/admin/app/(protected)/page.tsx` — add tabs (Pratos / Executivos)
- `apps/admin/lib/data/analytics.ts` — accept optional categoryId filter
- `apps/admin/tailwind.config.ts` — add Tremor to content paths
- `apps/admin/package.json` — add @tremor/react dependency

### Deleted files
- `apps/admin/components/AdminNavbar.tsx` — replaced by sidebar + bottom nav + mobile top bar
- `apps/admin/components/analytics/DayChart.tsx` — replaced by VisitsAreaChart
- `apps/admin/components/analytics/HourHistogram.tsx` — replaced by HourBarChart
- `apps/admin/components/analytics/TopList.tsx` — replaced by DonutChart + BarList
- `apps/admin/components/analytics/RangeSelector.tsx` — replaced by AnalyticsFilters

### Kept as-is
- `apps/admin/components/NavLink.tsx` — reused in sidebar (already vertical-compatible)
- `apps/admin/components/analytics/StatCard.tsx` — no changes
- `apps/admin/components/RestaurantSelector.tsx` — reused in sidebar + mobile top bar
- `apps/admin/components/PageHeader.tsx` — no changes

---

### Task 1: Install Tremor and configure Tailwind

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/tailwind.config.ts`

- [ ] **Step 1: Install @tremor/react in admin workspace**

Run:
```bash
cd apps/admin && pnpm add @tremor/react
```

- [ ] **Step 2: Add Tremor to Tailwind content paths**

In `apps/admin/tailwind.config.ts`, update the `content` array to include Tremor's components so their classes are not purged:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-app": "#f4f5f9",
        "bg-surface": "#ffffff",
        "bg-muted": "#eef0f6",
        "bg-warm": "#f4f5f9",
        "bg-card": "#ffffff",
        ink: {
          DEFAULT: "#1a0e6e",
          secondary: "#4a4580",
          muted: "#7c78a8",
          soft: "#7c78a8",
          faint: "#c8c5dc",
          ghost: "#e8e6f2",
          trace: "#e8e6f2",
        },
        accent: {
          DEFAULT: "#2d4ae8",
          hover: "#2340d4",
          soft: "rgba(45, 74, 232, 0.1)",
        },
        danger: {
          DEFAULT: "#dc2626",
          soft: "rgba(220, 38, 38, 0.08)",
        },
        tremor: {
          brand: {
            faint: "rgba(45, 74, 232, 0.05)",
            muted: "rgba(45, 74, 232, 0.15)",
            subtle: "rgba(45, 74, 232, 0.25)",
            DEFAULT: "#2d4ae8",
            emphasis: "#2340d4",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f4f5f9",
            subtle: "#eef0f6",
            DEFAULT: "#ffffff",
            emphasis: "#1a0e6e",
          },
          border: { DEFAULT: "#e8e6f2" },
          ring: { DEFAULT: "#e8e6f2" },
          content: {
            subtle: "#7c78a8",
            DEFAULT: "#4a4580",
            emphasis: "#1a0e6e",
            strong: "#1a0e6e",
            inverted: "#ffffff",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Verify the dev server starts**

Run:
```bash
cd apps/admin && pnpm dev
```
Expected: Dev server starts without errors on port 3001.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/package.json apps/admin/tailwind.config.ts pnpm-lock.yaml
git commit -m "feat(admin): add @tremor/react and configure Tailwind for Tremor"
```

---

### Task 2: Create AdminSidebar (desktop)

**Files:**
- Create: `apps/admin/components/AdminSidebar.tsx`

- [ ] **Step 1: Create the AdminSidebar server component**

```tsx
// apps/admin/components/AdminSidebar.tsx
import Image from "next/image";
import Link from "next/link";
import {
  ArrowSquareOut,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { NavLink } from "./NavLink";
import { RestaurantSelector } from "./RestaurantSelector";
import { BookOpenText, SquaresFour, ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import type { RestaurantRow } from "@/lib/active-restaurant";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

const NAV = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true },
  { href: "/cards", label: "Categorias", icon: SquaresFour },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp },
] as const;

type Props = {
  email: string | null;
  activeRestaurant: string;
  restaurants: RestaurantRow[];
};

export function AdminSidebar({ email, activeRestaurant, restaurants }: Props) {
  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-ink-ghost md:bg-bg-surface">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <Image src={LOGO_URL} alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-semibold text-ink">Kanpai Admin</span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ href, label, icon, ...rest }) => (
            <NavLink key={href} href={href} icon={icon} {...rest}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom section */}
        <div className="flex flex-col gap-3 border-t border-ink-ghost px-4 py-4">
          <a
            href="https://kanpai-blue.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-muted transition hover:bg-bg-muted hover:text-ink"
          >
            <ArrowSquareOut size={16} weight="duotone" />
            Ver site
          </a>

          <RestaurantSelector active={activeRestaurant} restaurants={restaurants} />

          <div className="border-t border-ink-ghost pt-3">
            {email ? (
              <p className="mb-2 truncate px-2 text-xs text-ink-faint" title={email}>
                {email}
              </p>
            ) : null}
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-secondary transition hover:bg-bg-muted hover:text-ink"
              >
                <SignOut size={16} weight="duotone" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/AdminSidebar.tsx
git commit -m "feat(admin): create AdminSidebar server component"
```

---

### Task 3: Create BottomNav (mobile)

**Files:**
- Create: `apps/admin/components/BottomNav.tsx`

- [ ] **Step 1: Create the BottomNav client component**

```tsx
// apps/admin/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, SquaresFour, ChartLineUp } from "@phosphor-icons/react";

const NAV = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true },
  { href: "/cards", label: "Categorias", icon: SquaresFour },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-ink-ghost bg-bg-surface md:hidden">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={
              "flex flex-col items-center gap-1 px-3 py-1 text-center transition " +
              (active ? "text-accent" : "text-ink-muted")
            }
          >
            <Icon size={20} weight={active ? "fill" : "duotone"} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/BottomNav.tsx
git commit -m "feat(admin): create BottomNav client component for mobile"
```

---

### Task 4: Create MobileTopBar

**Files:**
- Create: `apps/admin/components/MobileTopBar.tsx`

- [ ] **Step 1: Create the MobileTopBar client component**

This component handles the logo + hamburger for extras (RestaurantSelector, site link, sign out) on mobile only.

```tsx
// apps/admin/components/MobileTopBar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  List,
  SignOut,
  X,
} from "@phosphor-icons/react";
import { RestaurantSelector } from "./RestaurantSelector";
import type { RestaurantRow } from "@/lib/active-restaurant";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type Props = {
  email: string | null;
  activeRestaurant: string;
  restaurants: RestaurantRow[];
};

export function MobileTopBar({ email, activeRestaurant, restaurants }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-ghost/80 bg-bg-surface/95 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Kanpai Admin">
          <Image src={LOGO_URL} alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-semibold text-ink">Kanpai Admin</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink-ghost bg-bg-surface px-4 py-3">
          <div className="flex flex-col gap-3">
            <RestaurantSelector active={activeRestaurant} restaurants={restaurants} />
            <a
              href="https://kanpai-blue.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-bg-muted"
            >
              <ArrowSquareOut size={18} weight="duotone" />
              Ver site público
            </a>
            <div className="flex items-center justify-between gap-3 border-t border-ink-ghost pt-3">
              {email ? <span className="truncate text-xs text-ink-faint">{email}</span> : <span />}
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="admin-btn-secondary text-xs">
                  <SignOut size={16} />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/MobileTopBar.tsx
git commit -m "feat(admin): create MobileTopBar client component"
```

---

### Task 5: Refactor protected layout to use sidebar + bottom nav

**Files:**
- Modify: `apps/admin/app/(protected)/layout.tsx`

- [ ] **Step 1: Replace AdminNavbar with new navigation components**

Replace the entire content of `apps/admin/app/(protected)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/AdminSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileTopBar } from "@/components/MobileTopBar";
import { getActiveRestaurantId, listRestaurants } from "@/lib/active-restaurant";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [restaurants] = await Promise.all([listRestaurants()]);
  const activeRestaurant = getActiveRestaurantId();

  return (
    <div className="flex min-h-screen bg-bg-app">
      <AdminSidebar
        email={user.email ?? null}
        activeRestaurant={activeRestaurant}
        restaurants={restaurants}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar
          email={user.email ?? null}
          activeRestaurant={activeRestaurant}
          restaurants={restaurants}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 pb-20 sm:px-6 md:pb-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the admin loads with sidebar on desktop and bottom nav on mobile**

Run:
```bash
cd apps/admin && pnpm dev
```
Open `http://localhost:3001` — verify:
- Desktop (≥768px): sidebar on left with 3 nav items, no top navbar
- Mobile (<768px): top bar with logo + hamburger, bottom nav with 3 icons
- Navigation between pages works correctly
- Active states highlight the correct link

- [ ] **Step 3: Delete AdminNavbar**

Delete `apps/admin/components/AdminNavbar.tsx` — it is no longer imported anywhere.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/app/(protected)/layout.tsx
git rm apps/admin/components/AdminNavbar.tsx
git commit -m "feat(admin): replace top navbar with sidebar + bottom nav"
```

---

### Task 6: Create Tremor AreaChart wrapper (VisitsAreaChart)

**Files:**
- Create: `apps/admin/components/analytics/VisitsAreaChart.tsx`

- [ ] **Step 1: Create the VisitsAreaChart component**

```tsx
// apps/admin/components/analytics/VisitsAreaChart.tsx
"use client";

import { AreaChart } from "@tremor/react";
import type { SeriesPoint } from "@/lib/data/analytics";

type Props = {
  points: SeriesPoint[];
};

function fmtDay(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function VisitsAreaChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Sem dados no período.
      </div>
    );
  }

  const data = points.map((p) => ({
    dia: fmtDay(p.day),
    Visitas: p.visits,
    "Únicos": p.uniques,
  }));

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Visitas por dia</h3>
      <AreaChart
        data={data}
        index="dia"
        categories={["Visitas", "Únicos"]}
        colors={["blue", "gray"]}
        yAxisWidth={40}
        showAnimation
        className="h-52"
        curveType="monotone"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/analytics/VisitsAreaChart.tsx
git commit -m "feat(admin): create VisitsAreaChart Tremor component"
```

---

### Task 7: Create Tremor BarChart wrapper (HourBarChart)

**Files:**
- Create: `apps/admin/components/analytics/HourBarChart.tsx`

- [ ] **Step 1: Create the HourBarChart component**

```tsx
// apps/admin/components/analytics/HourBarChart.tsx
"use client";

import { BarChart } from "@tremor/react";

type Props = {
  hours: number[];
};

export function HourBarChart({ hours }: Props) {
  const total = hours.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Sem dados no período.
      </div>
    );
  }

  const data = hours.map((count, i) => ({
    hora: `${String(i).padStart(2, "0")}h`,
    Eventos: count,
  }));

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Horários de pico</h3>
      <BarChart
        data={data}
        index="hora"
        categories={["Eventos"]}
        colors={["blue"]}
        yAxisWidth={40}
        showAnimation
        className="h-52"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/analytics/HourBarChart.tsx
git commit -m "feat(admin): create HourBarChart Tremor component"
```

---

### Task 8: Create Tremor DonutChart wrapper (CategoriesDonutChart)

**Files:**
- Create: `apps/admin/components/analytics/CategoriesDonutChart.tsx`

- [ ] **Step 1: Create the CategoriesDonutChart component**

```tsx
// apps/admin/components/analytics/CategoriesDonutChart.tsx
"use client";

import { DonutChart } from "@tremor/react";
import type { CategoryRank } from "@/lib/data/analytics";

type Props = {
  categories: CategoryRank[];
};

export function CategoriesDonutChart({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Nenhuma categoria foi aberta no período.
      </div>
    );
  }

  const top5 = categories.slice(0, 5);
  const rest = categories.slice(5);
  const othersClicks = rest.reduce((sum, c) => sum + c.clicks, 0);

  const data = [
    ...top5.map((c) => ({ name: c.name, cliques: c.clicks })),
    ...(othersClicks > 0 ? [{ name: "Outros", cliques: othersClicks }] : []),
  ];

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Categorias mais acessadas</h3>
      <DonutChart
        data={data}
        category="cliques"
        index="name"
        colors={["blue", "cyan", "indigo", "violet", "fuchsia", "gray"]}
        showAnimation
        className="h-52"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/analytics/CategoriesDonutChart.tsx
git commit -m "feat(admin): create CategoriesDonutChart Tremor component"
```

---

### Task 9: Create Tremor BarList wrapper (DishesBarList)

**Files:**
- Create: `apps/admin/components/analytics/DishesBarList.tsx`

- [ ] **Step 1: Create the DishesBarList component**

```tsx
// apps/admin/components/analytics/DishesBarList.tsx
"use client";

import { BarList } from "@tremor/react";
import type { DishRank } from "@/lib/data/analytics";

type Props = {
  dishes: DishRank[];
};

export function DishesBarList({ dishes }: Props) {
  if (dishes.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-ink-faint bg-bg-card text-sm text-ink-muted">
        Nenhum item foi visualizado no período.
      </div>
    );
  }

  const data = dishes.slice(0, 10).map((d) => ({
    name: d.name,
    value: d.impressions,
  }));

  return (
    <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">Itens mais vistos</h3>
      <BarList
        data={data}
        color="blue"
        showAnimation
        className="h-52 overflow-y-auto"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/analytics/DishesBarList.tsx
git commit -m "feat(admin): create DishesBarList Tremor component"
```

---

### Task 10: Create AnalyticsFilters and update data layer

**Files:**
- Create: `apps/admin/components/analytics/AnalyticsFilters.tsx`
- Modify: `apps/admin/lib/data/analytics.ts`

- [ ] **Step 1: Update loadDashboard to accept optional categoryId**

In `apps/admin/lib/data/analytics.ts`, change the `fetchEvents` function and `loadDashboard` signature.

Find the `fetchEvents` function (lines 63-78) and add the `categoryId` parameter:

```ts
async function fetchEvents(
  restaurantId: string,
  start: string | null,
  end: string,
  categoryId?: string
): Promise<EventRow[]> {
  const supabase = createServerClient();
  let q = supabase
    .from("analytics_events")
    .select("visitor_id, session_id, event_type, category_id, dish_slug, created_at")
    .eq("restaurant_id", restaurantId)
    .lt("created_at", end);
  if (start) q = q.gte("created_at", start);
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(50000);
  if (error) throw error;
  return (data ?? []) as EventRow[];
}
```

Then update the `loadDashboard` function signature (line 289) to accept `categoryId`:

```ts
export async function loadDashboard(range: Range, restaurantId: string, categoryId?: string): Promise<DashboardData> {
  const window = rangeWindow(range);
  const [events, names] = await Promise.all([
    fetchEvents(restaurantId, window.start, window.end, categoryId),
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
    const prev = await fetchEvents(restaurantId, window.prevStart, window.prevEnd, categoryId);
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
```

Also add a function to load category options for the filter dropdown. Add this at the end of the file:

```ts
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
```

- [ ] **Step 2: Create the AnalyticsFilters component**

```tsx
// apps/admin/components/analytics/AnalyticsFilters.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import {
  CalendarBlank,
  CaretDown,
  SquaresFour,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { RANGE_LABELS, RANGE_ORDER, type Range } from "@/lib/data/analytics-shared";

type CategoryOption = { slug: string; name: string; id: string };

type Props = {
  activeRange: Range;
  activeCategory: string | null;
  categories: CategoryOption[];
};

function Dropdown({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ size: number; weight: string }>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-ink-ghost bg-bg-surface px-4 py-2 text-sm text-ink transition hover:border-ink-faint"
      >
        <Icon size={16} weight="duotone" />
        <span>{label}</span>
        <CaretDown size={14} weight="bold" className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-ink-ghost bg-bg-surface py-1 shadow-lg"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function buildHref(range: Range, category: string | null): string {
  const params = new URLSearchParams();
  params.set("range", range);
  if (category) params.set("category", category);
  return `/analytics?${params.toString()}`;
}

export function AnalyticsFilters({ activeRange, activeCategory, categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown
        label={RANGE_LABELS[activeRange]}
        icon={CalendarBlank}
      >
        {RANGE_ORDER.map((r) => (
          <Link
            key={r}
            href={buildHref(r, activeCategory)}
            className={
              "block px-4 py-2 text-sm transition hover:bg-bg-muted " +
              (r === activeRange ? "bg-accent-soft font-medium text-accent" : "text-ink")
            }
          >
            {RANGE_LABELS[r]}
          </Link>
        ))}
      </Dropdown>

      <Dropdown
        label={
          activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name ?? "Categoria"
            : "Todas categorias"
        }
        icon={SquaresFour}
      >
        <Link
          href={buildHref(activeRange, null)}
          className={
            "block px-4 py-2 text-sm transition hover:bg-bg-muted " +
            (!activeCategory ? "bg-accent-soft font-medium text-accent" : "text-ink")
          }
        >
          Todas categorias
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={buildHref(activeRange, c.slug)}
            className={
              "block px-4 py-2 text-sm transition hover:bg-bg-muted " +
              (activeCategory === c.slug ? "bg-accent-soft font-medium text-accent" : "text-ink")
            }
          >
            {c.name}
          </Link>
        ))}
      </Dropdown>

      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-ghost bg-bg-surface text-ink-muted transition hover:border-ink-faint hover:text-ink disabled:opacity-50"
        aria-label="Atualizar"
      >
        <ArrowsClockwise size={16} weight="bold" className={pending ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/admin/lib/data/analytics.ts apps/admin/components/analytics/AnalyticsFilters.tsx
git commit -m "feat(admin): create AnalyticsFilters + add categoryId filter to data layer"
```

---

### Task 11: Refactor analytics page with Tremor charts and filters

**Files:**
- Modify: `apps/admin/app/(protected)/analytics/page.tsx`

- [ ] **Step 1: Replace analytics page with Tremor charts and new filters**

Replace the full content of `apps/admin/app/(protected)/analytics/page.tsx`:

```tsx
import { PageHeader } from "@/components/PageHeader";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { StatCard } from "@/components/analytics/StatCard";
import { VisitsAreaChart } from "@/components/analytics/VisitsAreaChart";
import { HourBarChart } from "@/components/analytics/HourBarChart";
import { CategoriesDonutChart } from "@/components/analytics/CategoriesDonutChart";
import { DishesBarList } from "@/components/analytics/DishesBarList";
import { loadDashboard, loadCategoryOptions, type Range } from "@/lib/data/analytics";
import { getActiveRestaurantId } from "@/lib/active-restaurant";

type SearchParams = { range?: string; category?: string };

const VALID_RANGES: Range[] = ["today", "yesterday", "7d", "30d", "90d", "all"];

function asRange(input: string | undefined): Range {
  return VALID_RANGES.includes(input as Range) ? (input as Range) : "7d";
}

function fmtNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

function fmtDecimal(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function fmtPct(n: number): string {
  return `${(n * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function delta(current: number, prev: number | undefined | null): number | null {
  if (prev == null) return null;
  if (prev === 0) return current === 0 ? 0 : null;
  return (current - prev) / prev;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const range = asRange(searchParams.range);
  const categorySlug = searchParams.category ?? null;
  const restaurantId = getActiveRestaurantId();

  const filterCategories = await loadCategoryOptions(restaurantId);
  const categoryId = categorySlug
    ? filterCategories.find((c) => c.slug === categorySlug)?.id
    : undefined;

  const data = await loadDashboard(range, restaurantId, categoryId);

  const { stats, prevStats, insights, daySeries, hourHistogram, topCategories, topDishes } = data;

  return (
    <section className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Analytics"
          description="Comportamento do cardápio digital — dados reais do site público."
        />
        <AnalyticsFilters
          activeRange={range}
          activeCategory={categorySlug}
          categories={filterCategories}
        />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visitantes únicos"
          value={fmtNumber(stats.visitors)}
          hint="Pessoas distintas (cookie)"
          delta={delta(stats.visitors, prevStats?.visitors)}
        />
        <StatCard
          label="Views de itens"
          value={fmtNumber(stats.dishImpressions + stats.dishViews)}
          hint={`${fmtNumber(stats.dishImpressions)} impressões · ${fmtNumber(stats.dishViews)} ver detalhes`}
          delta={delta(
            stats.dishImpressions + stats.dishViews,
            prevStats ? prevStats.dishImpressions + prevStats.dishViews : null
          )}
        />
        <StatCard
          label="Itens por visita"
          value={fmtDecimal(stats.itemsPerVisit)}
          hint="Profundidade média"
          delta={delta(stats.itemsPerVisit, prevStats?.itemsPerVisit)}
        />
        <StatCard
          label="Engajamento"
          value={fmtPct(stats.engagementRate)}
          hint="Sessões com ≥1 item visto"
          delta={delta(stats.engagementRate, prevStats?.engagementRate)}
        />
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-ink-faint bg-bg-card p-5">
        <h3 className="text-sm font-medium text-ink">Insights rápidos</h3>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
          {insights.topCategory ? (
            <li>
              · Categoria mais clicada: <strong className="text-ink">{topCategories[0]?.name ?? insights.topCategory.id}</strong>{" "}
              ({fmtNumber(insights.topCategory.count)} cliques · {fmtNumber(insights.topCategory.people)} pessoas)
            </li>
          ) : null}
          {insights.topDishImpression ? (
            <li>
              · Item mais visto: <strong className="text-ink">{topDishes[0]?.name ?? insights.topDishImpression.slug}</strong>{" "}
              ({fmtNumber(insights.topDishImpression.count)} views · {fmtNumber(insights.topDishImpression.people)} pessoas)
            </li>
          ) : null}
          {insights.peakHour ? (
            <li>
              · Maior pico de acesso: <strong className="text-ink">{String(insights.peakHour.hour).padStart(2, "0")}h</strong>{" "}
              ({fmtNumber(insights.peakHour.count)} eventos)
            </li>
          ) : null}
          <li>
            · Taxa de engajamento: <strong className="text-ink">{fmtPct(stats.engagementRate)}</strong> das visitas clicaram em pelo menos um item.
          </li>
          <li>
            · Cada visitante viu em média{" "}
            <strong className="text-ink">
              {stats.visitors === 0 ? "0" : fmtDecimal((stats.dishImpressions + stats.dishViews) / stats.visitors)}
            </strong>{" "}
            itens.
          </li>
          <li>
            · Cada sessão gerou em média <strong className="text-ink">{fmtDecimal(stats.itemsPerVisit)}</strong> visualizações de itens.
          </li>
        </ul>
        {stats.views === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-ink-faint bg-bg-warm p-3 text-xs text-ink-muted">
            Ainda não há eventos no período selecionado. Visite o site público (em outra aba ou outro dispositivo) e os dados aparecem aqui após alguns segundos.
          </p>
        ) : null}
      </div>

      {/* Charts row 1: Area + Bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <VisitsAreaChart points={daySeries} />
        <HourBarChart hours={hourHistogram} />
      </div>

      {/* Charts row 2: Donut + BarList */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoriesDonutChart categories={topCategories} />
        <DishesBarList dishes={topDishes} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete old chart components**

Delete these files:
- `apps/admin/components/analytics/DayChart.tsx`
- `apps/admin/components/analytics/HourHistogram.tsx`
- `apps/admin/components/analytics/TopList.tsx`
- `apps/admin/components/analytics/RangeSelector.tsx`

- [ ] **Step 3: Verify analytics page loads with Tremor charts**

Run:
```bash
cd apps/admin && pnpm dev
```
Open `http://localhost:3001/analytics` — verify:
- AreaChart renders with visits data
- BarChart renders with hour histogram
- DonutChart renders categories
- BarList renders top dishes
- Pill filter dropdowns work (changing range, filtering by category)
- Refresh button works
- StatCards and Insights section unchanged

- [ ] **Step 4: Commit**

```bash
git rm apps/admin/components/analytics/DayChart.tsx apps/admin/components/analytics/HourHistogram.tsx apps/admin/components/analytics/TopList.tsx apps/admin/components/analytics/RangeSelector.tsx
git add apps/admin/app/(protected)/analytics/page.tsx
git commit -m "feat(admin): migrate analytics to Tremor charts + styled filters"
```

---

### Task 12: Verify Cardápio page works with new sidebar

Note: The executivos feature has been removed from the codebase (migration `drop_executivos.sql`). No tab system needed — Cardápio page stays as-is with just pratos.

- [ ] **Step 1: Verify Cardápio page works correctly with new layout**

Open `http://localhost:3001` — verify:
- Page loads correctly with sidebar layout
- Category chips and dishes table display correctly
- "Novo item" button works
- Category selection via chips works

---

### Task 13: Final verification and cleanup

- [ ] **Step 1: Run typecheck**

```bash
cd apps/admin && pnpm exec tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 2: Run build**

```bash
cd apps/admin && pnpm build
```
Expected: Build succeeds.

- [ ] **Step 3: Visual verification**

Open `http://localhost:3001` and verify all flows:
1. Sidebar shows on desktop with 3 nav items (Cardápio, Categorias, Analytics)
2. Bottom nav shows on mobile with 3 icons
3. Mobile top bar has logo + hamburger (opens RestaurantSelector, site link, sign out)
4. Cardápio page has Pratos/Executivos tabs
5. Analytics page has Tremor AreaChart, BarChart, DonutChart, BarList
6. Analytics filters are pill dropdowns (period + category)
7. All navigation links work correctly
8. Restaurant selector works in sidebar (desktop) and mobile top bar

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix(admin): cleanup after redesign"
```
