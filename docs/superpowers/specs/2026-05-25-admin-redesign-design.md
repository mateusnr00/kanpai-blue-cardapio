# Admin Redesign — Sidebar, Tremor Analytics, Filtros

**Data:** 2026-05-25
**Escopo:** Redesign da navegação e analytics do admin panel

---

## 1. Sidebar + Layout

### Desktop (≥ md)

- Layout muda de `flex-col` (navbar + content) para `flex-row` (sidebar + content)
- Sidebar fixa: `w-60` (240px), `h-screen`, `sticky top-0`
- Background: `bg-bg-surface`, `border-r border-ink-ghost`
- Conteúdo principal: `flex-1`, `max-w-[1440px]`, padding existente mantido

### Sidebar — Estrutura

```
┌─────────────┐
│ Logo + Title│  Kanpai Admin (imagem + texto)
│─────────────│
│ 📋 Cardápio │  NavLink ativo: bg-accent-soft text-accent
│ 🗂 Categorias│  NavLink inativo: text-ink-secondary
│ 📊 Analytics│
│─────────────│
│ 🔗 Ver site │  Link externo (target=_blank)
│ 🏪 Restaur. │  RestaurantSelector
│─────────────│
│ 👤 email    │  Truncado
│ 🚪 Sair     │  Form action sign-out
└─────────────┘
```

- NavLinks com ícones Phosphor (BookOpenText, SquaresFour, ChartLineUp)
- Active: `bg-accent-soft text-accent` com ícone `weight="fill"`
- Inactive: `text-ink-secondary` com ícone `weight="duotone"`
- Cada link: `rounded-lg px-3 py-2.5 text-sm font-medium`
- Separadores: `border-t border-ink-ghost` entre seções

### Mobile (< md)

**Bottom nav:**
- `fixed bottom-0 inset-x-0`, `h-16`, `bg-bg-surface`, `border-t border-ink-ghost`, `z-50`
- 3 itens centralizados: ícone (20px) + label (xs) empilhados
- Active: `text-accent`, inactive: `text-ink-muted`
- Main content recebe `pb-20` no mobile para compensar bottom nav

**Top bar mobile:**
- `sticky top-0`, `h-14`, logo + hamburger à direita
- Hamburger abre overlay com: RestaurantSelector, link Site, email, Sair
- Mesmo mecanismo de open/close do AdminNavbar atual

### Componentes

| Arquivo | Tipo | Ação |
|---------|------|------|
| `AdminNavbar.tsx` | client | **Removido** |
| `NavLink.tsx` | client | **Mantido** (adaptar para sidebar vertical) |
| `AdminSidebar.tsx` | server | **Novo** — sidebar desktop |
| `BottomNav.tsx` | client | **Novo** — nav mobile (usePathname) |
| `MobileTopBar.tsx` | client | **Novo** — top bar + hamburger extras |
| `(protected)/layout.tsx` | server | **Refatorado** — flex-row com sidebar |

---

## 2. Analytics com Tremor

### Dependência

Instalar `@tremor/react` no `apps/admin`.

### Substituições de charts

| Componente atual | Componente Tremor | Fonte de dados |
|------------------|-------------------|----------------|
| `DayChart.tsx` (SVG custom) | `AreaChart` | `daySeries[]` — `{ day, visits, uniques }` |
| `HourHistogram.tsx` (SVG custom) | `BarChart` | `hourHistogram[24]` → `{ hour: "00h", eventos: n }` |
| `TopList.tsx` (ranking) — categorias | `DonutChart` | `topCategories[]` — top 5 + "Outros" |
| `TopList.tsx` (ranking) — pratos | `BarList` | `topDishes[]` — top 10 |

### Layout da página analytics

```
┌─────────────────────────────────────────────────┐
│ PageHeader "Analytics"       [Filtros dropdowns] │
├─────────────────────────────────────────────────┤
│ [StatCard] [StatCard] [StatCard] [StatCard]      │
├─────────────────────────────────────────────────┤
│ Insights rápidos (mantido)                       │
├──────────────────────┬──────────────────────────┤
│ AreaChart            │ BarChart                  │
│ Visitas por dia      │ Horários de pico          │
│ grid: 2fr            │ grid: 1fr                 │
├──────────────────────┼──────────────────────────┤
│ DonutChart           │ BarList                   │
│ Top categorias       │ Top itens por views        │
│ grid: 1fr            │ grid: 1fr                 │
└──────────────────────┴──────────────────────────┘
```

### AreaChart — Visitas por dia

- Wrapper: `admin-card` com título "Visitas por dia"
- Series: "Visitas" (area fill) + "Únicos" (line)
- X-axis: dia formatado ("25 Mai")
- Cores: accent para visitas, ink-muted para únicos
- Dados: `daySeries` já está no formato correto

### BarChart — Horários de pico

- Wrapper: `admin-card` com título "Horários de pico"
- 24 barras verticais (00h–23h)
- Cor: accent
- Dados: transformar `hourHistogram[24]` em `[{ hour: "00h", eventos: 42 }, ...]`

### DonutChart — Categorias mais acessadas

- Wrapper: `admin-card` com título "Categorias mais acessadas"
- Top 5 categorias por cliques, resto agrupado como "Outros"
- Legenda lateral com nome + contagem
- Paleta: accent + variações do design system

### BarList — Itens mais vistos

- Wrapper: `admin-card` com título "Itens mais vistos"
- Top 10 itens por impressões
- Nome do prato + barra horizontal + contagem
- Cor: accent

### Componentes

| Arquivo | Ação |
|---------|------|
| `analytics/DayChart.tsx` | **Substituído** por AreaChart wrapper |
| `analytics/HourHistogram.tsx` | **Substituído** por BarChart wrapper |
| `analytics/TopList.tsx` | **Substituído** por DonutChart + BarList wrappers |
| `analytics/StatCard.tsx` | **Mantido** |
| `analytics/RangeSelector.tsx` | **Removido** (substituído por filtros) |
| `analytics/page.tsx` | **Refatorado** — novo layout |

---

## 3. Filtros Globais Estilizados

### Design visual

Dropdowns pill posicionados à direita do PageHeader:

```
Analytics                         [📅 7 dias ▾] [🔄]
Comportamento do cardápio...      [🗂 Todas ▾]
```

### Filtro de período

- Estilo: `rounded-full border border-ink-ghost bg-bg-surface px-4 py-2 text-sm`
- Ícone: `CalendarBlank` (Phosphor) + label do range + `CaretDown`
- Dropdown: lista com opções (Hoje, Ontem, 7 dias, 30 dias, 90 dias, Tudo)
- Item ativo: `bg-accent-soft text-accent`
- Navegação: `<Link>` com searchParams (server-side, sem estado client)

### Filtro por categoria

- Mesmo estilo pill
- Ícone: `SquaresFour` + "Todas categorias" (default)
- Dropdown carregado via query Supabase `categories` filtrado por `restaurant_id` (mesma fonte do CRUD)
- Valor via searchParams: `?range=7d&category=<slug>`

### Botão refresh

- Ícone `ArrowClockwise`, `rounded-full`, ghost style
- Link para mesma URL (força revalidação)

### Mobile

- Filtros fazem wrap para linha abaixo do título
- Mantêm mesmo estilo pill

### Lógica de dados

- `loadDashboard(range, restaurantId, categoryId?)` aceita categoryId opcional
- Quando categoryId presente, filtra `fetchEvents` por `category_id`
- StatCards, insights, e charts refletem apenas a categoria filtrada

### Componentes

| Arquivo | Ação |
|---------|------|
| `analytics/RangeSelector.tsx` | **Removido** |
| `analytics/AnalyticsFilters.tsx` | **Novo** — server component com dropdowns |
| `lib/data/analytics.ts` | **Atualizado** — aceita categoryId |
| `analytics/page.tsx` | **Atualizado** — passa searchParams.category |

---

## 4. Executivos como Sub-seção de Cardápio

### Tabs no Cardápio

```
┌─────────────────────────────────────────────┐
│ Cardápio                      [+ Novo prato]│
├─────────────────────────────────────────────┤
│ [Pratos]  [Executivos]                      │
├─────────────────────────────────────────────┤
│  (conteúdo da tab ativa)                    │
└─────────────────────────────────────────────┘
```

### Implementação

- Tabs controladas por `searchParams`: `?tab=executivos`
- Default: tab "Pratos"
- Tab ativa: `border-b-2 border-accent text-accent font-medium`
- Tab inativa: `text-ink-muted hover:text-ink`
- Server component — sem estado client
- Botão de ação no header muda: "+ Novo prato" vs "+ Novo executivo"

### Conteúdo das tabs

- **Tab Pratos:** conteúdo atual de `/admin/page.tsx` (chips categoria + tabela)
- **Tab Executivos:** conteúdo atual de `/executivos/page.tsx`

### Rotas

- `/admin?tab=executivos` — lista executivos
- `/executivos/new` e `/executivos/[id]` — CRUD mantido como sub-rotas
- `/executivos` (page.tsx) — **removido** ou redirect para `/admin?tab=executivos`

### Componentes

| Arquivo | Ação |
|---------|------|
| `(protected)/admin/page.tsx` | **Refatorado** — sistema de tabs |
| `(protected)/executivos/page.tsx` | Conteúdo extraído para componente, rota vira redirect |
| `AdminSidebar.tsx` | 3 itens apenas (sem Executivos) |
| `BottomNav.tsx` | 3 itens apenas |

---

## Decisões de design

- **Ícones:** Phosphor Icons mantidos em todo o projeto
- **Paleta de cores:** mantida (roxo/azul ink + accent blue)
- **Micro-interações:** puladas nesta fase
- **Tabelas:** sem alteração visual nesta fase
- **Header com contexto:** adiado para próxima iteração
- **StatCard:** mantido sem alteração (já está bom)
- **Insights:** bloco mantido como está
