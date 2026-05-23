# Fase 3 — Site público lê do Supabase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aposentar `apps/site/lib/menu-data.ts` como fonte de dados em runtime. O cardápio público (`apps/site`) passa a ler categorias, pratos, executivos e seções diretamente do Supabase via Server Components, com `revalidate: 60` pra cache leve. Edições no admin viram visíveis no site sem deploy.

**Architecture:** Novo módulo `apps/site/lib/menu-server.ts` exporta `getCategories()` que monta o array `Category[]` no mesmo shape que os componentes já consomem (apenas mudou a origem dos dados). Pages e layout viram async. SearchBar (client) recebe `categories` como prop, propagada via layout → AppShell → Header. Tipos saem de `menu-data.ts` pra `menu-types.ts` puro (sem dados). O `menu-data.ts` perde o array `categories` mas mantém `restaurant` e as re-exportações de tipos (compat).

**Tech Stack:** Next.js 14 Server Components, `@supabase/ssr`, `@kanpai/db`, `revalidate: 60`.

**Pré-requisito:** Fase 2 mergeada. Banco já tem 10 categorias, 138 pratos, 8 sections, 2 executivos.

---

## File Structure

**Novos:**
```
apps/site/lib/
├── menu-types.ts          # NEW: tipos (Dish, Category, DishDetails, ExecutivoMenu, etc) extraídos
├── menu-server.ts         # NEW: getCategories(), getCategoryBySlug() — async, Supabase-backed
└── supabase-server.ts     # NEW: createServerClient pro site (mesmo padrão do admin)
```

**Modificados:**
- `apps/site/lib/menu-data.ts`: tira o array `categories` e a função `getCategoryBySlug`. Mantém `restaurant` e re-exporta tipos de `menu-types.ts` pra compat.
- `apps/site/app/page.tsx`: async, usa `getCategories()`.
- `apps/site/app/[categoria]/page.tsx`: async, usa `getCategories()` (precisa do array todo pra metadata + render).
- `apps/site/app/layout.tsx`: async, fetcha `categories` uma vez e passa pro AppShell.
- `apps/site/components/AppShell.tsx`: aceita `categories` prop, passa pro Header.
- `apps/site/components/Header.tsx`: aceita `categories` prop, passa pro SearchBar.
- `apps/site/components/SearchBar.tsx`: aceita `categories` como prop em vez de importar.

---

## Task 1: Branch

- [ ] **Step 1**

```bash
git checkout main && git pull --ff-only origin main
git checkout -b feat/site-le-supabase
git status
```

Expected: clean tree (untracked artifacts da raiz podem aparecer; ignore).

---

## Task 2: Extrair tipos pra menu-types.ts

**Files:**
- Create: `apps/site/lib/menu-types.ts`
- Modify: `apps/site/lib/menu-data.ts` (remover types daqui, re-exportar de menu-types)

- [ ] **Step 1: Criar `menu-types.ts`**

Conteúdo:

```ts
// ============================================================================
// CARDÁPIO KANPAI BLUE · TIPOS
// ============================================================================
// Compartilhado entre menu-data (snapshot histórico) e menu-server (Supabase).

export type DishDetailSection = {
  label: string;
  description: string;
};

export type DishDetails = {
  longDescription?: string;
  sections: DishDetailSection[];
};

export type Dish = {
  id: string;
  name: string;
  price: string;
  unit?: string;
  description?: string;
  featured?: boolean;
  subcategory?: string;
  originalPrice?: string;
  tags?: string[];
  details?: DishDetails;
  image?: string;          // URL pública opcional; site usa placeholder quando falta
};

export type ExecutivoMenu = {
  name: string;
  price: string;
  format: string;
  description: string;
  validity?: string;
  subcategory?: string;
  entradas: { name: string; description: string }[];
  principais: { name: string; description: string }[];
  sobremesas?: { name: string; price: string; description: string }[];
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
  executivos?: ExecutivoMenu[];
};
```

- [ ] **Step 2: Atualizar `apps/site/lib/menu-data.ts`**

Substituir os `export type Dish/Category/...` por:

```ts
export type {
  DishDetailSection,
  DishDetails,
  Dish,
  ExecutivoMenu,
  Category,
} from "./menu-types";
```

Mantém `restaurant`, `categories` (array) e `getCategoryBySlug` por enquanto. Esse arquivo vira deprecado completo na Task 9, mas a Task 2 só extrai os tipos.

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
```
Expected: zero errors (pages e components continuam importando os mesmos nomes via re-export).

```bash
git add apps/site/lib/menu-types.ts apps/site/lib/menu-data.ts
git commit -m "refactor(site): extrair tipos do menu pra menu-types.ts"
```

---

## Task 3: Cliente Supabase server-side pro site

**Files:**
- Create: `apps/site/lib/supabase-server.ts`

- [ ] **Step 1**

```ts
import { cookies } from "next/headers";
import { createServerClient as createSSR, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@kanpai/db";

export function createServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const client = createSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // server components sem mutation
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // idem
          }
        },
      },
    }
  );
  return client as unknown as SupabaseClient<Database>;
}
```

> Padrão idêntico ao `apps/admin/lib/supabase-server.ts`. Cast `as unknown as` evita o conflito de tipos entre `@supabase/ssr` e `@supabase/supabase-js` que já encontramos em Fase 1B.

- [ ] **Step 2: Commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
git add apps/site/lib/supabase-server.ts
git commit -m "feat(site): cliente Supabase server-side"
```

---

## Task 4: getCategories() em menu-server.ts

**Files:**
- Create: `apps/site/lib/menu-server.ts`

- [ ] **Step 1**

Conteúdo completo:

```ts
import { createServerClient } from "./supabase-server";
import type { Category, Dish, DishDetailSection, ExecutivoMenu } from "./menu-types";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/dish-images/`;

function imageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${STORAGE_BASE}${path}`;
}

/**
 * Lê todas as categorias ativas + pratos + seções + executivos do Supabase
 * e devolve no shape que os componentes do site consomem (Category[]).
 *
 * Filtra `active = true` em categories, dishes e executivo_menus.
 * Sections, dish_variants e executivo_items são lidos integralmente.
 * Ordem: position ascendente em todos os níveis.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();

  const [catsRes, dishesRes, sectionsRes, execMenusRes, execItemsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, number, name, short_name, description, item_count, detail, gradient, featured, position, subcategories")
      .eq("active", true)
      .order("position"),
    supabase
      .from("dishes")
      .select("id, slug, category_id, name, price, unit, description, long_description, subcategory, featured, original_price, image_path, position, badges")
      .eq("active", true)
      .order("position"),
    supabase
      .from("dish_detail_sections")
      .select("dish_id, label, description, position")
      .order("position"),
    supabase
      .from("executivo_menus")
      .select("id, category_id, name, price, format, description, validity, subcategory, position")
      .eq("active", true)
      .order("position"),
    supabase
      .from("executivo_items")
      .select("executivo_id, kind, name, description, price, position")
      .order("position"),
  ]);

  if (catsRes.error) throw catsRes.error;
  if (dishesRes.error) throw dishesRes.error;
  if (sectionsRes.error) throw sectionsRes.error;
  if (execMenusRes.error) throw execMenusRes.error;
  if (execItemsRes.error) throw execItemsRes.error;

  const sectionsByDish = new Map<string, DishDetailSection[]>();
  for (const s of sectionsRes.data ?? []) {
    const arr = sectionsByDish.get(s.dish_id) ?? [];
    arr.push({ label: s.label, description: s.description });
    sectionsByDish.set(s.dish_id, arr);
  }

  const dishesByCategory = new Map<string, Dish[]>();
  for (const d of dishesRes.data ?? []) {
    const sections = sectionsByDish.get(d.id) ?? [];
    const dish: Dish = {
      id: d.slug,
      name: d.name,
      price: d.price ?? "",
      unit: d.unit ?? undefined,
      description: d.description ?? undefined,
      featured: d.featured,
      subcategory: d.subcategory ?? undefined,
      originalPrice: d.original_price ?? undefined,
      tags: d.badges?.length ? d.badges : undefined,
      image: imageUrl(d.image_path),
    };
    if (d.long_description || sections.length > 0) {
      dish.details = {
        longDescription: d.long_description ?? undefined,
        sections,
      };
    }
    const arr = dishesByCategory.get(d.category_id) ?? [];
    arr.push(dish);
    dishesByCategory.set(d.category_id, arr);
  }

  type ExecItem = { kind: "entrada" | "principal" | "sobremesa"; name: string; description: string; price: string | null };
  const itemsByExec = new Map<string, ExecItem[]>();
  for (const it of execItemsRes.data ?? []) {
    const arr = itemsByExec.get(it.executivo_id) ?? [];
    arr.push({ kind: it.kind as ExecItem["kind"], name: it.name, description: it.description, price: it.price });
    itemsByExec.set(it.executivo_id, arr);
  }

  const execsByCategory = new Map<string, ExecutivoMenu[]>();
  for (const ex of execMenusRes.data ?? []) {
    const items = itemsByExec.get(ex.id) ?? [];
    const exec: ExecutivoMenu = {
      name: ex.name,
      price: ex.price,
      format: ex.format,
      description: ex.description,
      validity: ex.validity ?? undefined,
      subcategory: ex.subcategory ?? undefined,
      entradas: items.filter((it) => it.kind === "entrada").map((it) => ({ name: it.name, description: it.description })),
      principais: items.filter((it) => it.kind === "principal").map((it) => ({ name: it.name, description: it.description })),
    };
    const sobremesas = items.filter((it) => it.kind === "sobremesa");
    if (sobremesas.length > 0) {
      exec.sobremesas = sobremesas.map((it) => ({ name: it.name, description: it.description, price: it.price ?? "" }));
    }
    const arr = execsByCategory.get(ex.category_id) ?? [];
    arr.push(exec);
    execsByCategory.set(ex.category_id, arr);
  }

  return (catsRes.data ?? []).map((c): Category => {
    const cat: Category = {
      id: c.id,
      number: c.number,
      name: c.name,
      shortName: c.short_name ?? undefined,
      description: c.description,
      itemCount: c.item_count ?? "",
      detail: c.detail ?? "",
      featured: c.featured,
      subcategories: c.subcategories?.length ? c.subcategories : undefined,
      gradient: c.gradient,
      dishes: dishesByCategory.get(c.id) ?? [],
    };
    const execs = execsByCategory.get(c.id);
    if (execs && execs.length > 0) cat.executivos = execs;
    return cat;
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await getCategories();
  return all.find((c) => c.id === slug);
}
```

> `getCategoryBySlug` faz fetch+filter pra reusar o assembly. Em produção isso roda dentro do cache de 60s da page, então é OK.

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
git add apps/site/lib/menu-server.ts
git commit -m "feat(site): getCategories/getCategoryBySlug lendo do Supabase"
```

---

## Task 5: SearchBar aceita categories como prop

**Files:**
- Modify: `apps/site/components/SearchBar.tsx`

- [ ] **Step 1: Substituir import + adicionar prop**

No topo do arquivo, REMOVER:
```ts
import { categories, type Dish } from "@/lib/menu-data";
```

ADICIONAR:
```ts
import type { Category, Dish } from "@/lib/menu-types";
```

Mudar a assinatura de `SearchBar` para aceitar `categories`:

```tsx
type SearchBarProps = {
  categories: Category[];
};

export function SearchBar({ categories }: SearchBarProps) {
```

Dentro do componente, `buildIndex` precisa do `categories` via closure. Substitua a função `buildIndex` global por uma versão inline dentro do componente:

```tsx
const index = useMemo<Result[]>(() => {
  const out: Result[] = [];
  for (const c of categories) {
    for (const d of c.dishes) {
      out.push({ dish: d, categoryId: c.id, categoryName: c.name });
    }
  }
  return out;
}, [categories]);
```

> Se `buildIndex()` for chamada em outro lugar dentro do componente (ex: dentro de `useMemo`), remover essa chamada e usar diretamente `index` calculado acima.

Remova a função `buildIndex()` standalone do topo do arquivo.

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
```

> Se aparecer erro em outras chamadas a SearchBar (Header), é esperado — corrigimos na Task 6.

```bash
git add apps/site/components/SearchBar.tsx
git commit -m "refactor(site): SearchBar aceita categories como prop"
```

---

## Task 6: Header aceita categories como prop, passa pra SearchBar

**Files:**
- Modify: `apps/site/components/Header.tsx`

- [ ] **Step 1: Adicionar prop**

Localize a definição `type Props = { showBack?: boolean; };` e mude para:

```ts
import type { Category } from "@/lib/menu-types";

type Props = {
  showBack?: boolean;
  categories: Category[];
};

export function Header({ showBack = false, categories }: Props) {
```

Localize a chamada `<SearchBar />` no JSX e mude para:

```tsx
<SearchBar categories={categories} />
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
```

> Erro esperado em AppShell — corrigido na Task 7.

```bash
git add apps/site/components/Header.tsx
git commit -m "refactor(site): Header aceita categories e passa pra SearchBar"
```

---

## Task 7: AppShell aceita categories, passa pro Header

**Files:**
- Modify: `apps/site/components/AppShell.tsx`

- [ ] **Step 1: Inspecionar arquivo primeiro**

Read `apps/site/components/AppShell.tsx`. Provavelmente é assim:

```tsx
"use client";

type Props = { children: React.ReactNode; showBack?: boolean };

export function AppShell({ children, showBack }: Props) {
  return (
    <>
      <Header showBack={showBack} />
      {children}
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Adicionar prop categories**

Adicionar import:
```ts
import type { Category } from "@/lib/menu-types";
```

Mudar Props:
```ts
type Props = {
  children: React.ReactNode;
  showBack?: boolean;
  categories: Category[];
};

export function AppShell({ children, showBack, categories }: Props) {
```

E na chamada do Header:
```tsx
<Header showBack={showBack} categories={categories} />
```

> Se AppShell tiver outras props/estrutura, adapte preservando o existente. NÃO restruture o componente; só adicione a prop.

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
```

> Erro esperado em layout.tsx — corrigido na Task 8.

```bash
git add apps/site/components/AppShell.tsx
git commit -m "refactor(site): AppShell aceita categories e propaga pro Header"
```

---

## Task 8: layout.tsx fetcha categories e passa pra AppShell; pages async

**Files:**
- Modify: `apps/site/app/layout.tsx`
- Modify: `apps/site/app/page.tsx`
- Modify: `apps/site/app/[categoria]/page.tsx`

- [ ] **Step 1: Atualizar `apps/site/app/layout.tsx`**

Read o arquivo inteiro primeiro pra entender a estrutura. Provavelmente RootLayout é sync.

Mudar pra async + fetchar categories + passar pro AppShell:

```tsx
// Topo do arquivo
import { getCategories } from "@/lib/menu-server";

// Adicionar revalidate (uma vez por minuto)
export const revalidate = 60;

// Mudar função pra async
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="pt-BR" /* ...resto dos atribs */>
      <body /* ... */>
        {/* providers existentes */}
        <AppShell categories={categories}>
          {children}
        </AppShell>
        {/* etc */}
      </body>
    </html>
  );
}
```

> **Importante:** preserve TUDO mais do layout (font, providers, classes, etc). Apenas: torna async, adiciona `export const revalidate = 60`, importa getCategories, e adiciona `categories={categories}` no `<AppShell>`.

- [ ] **Step 2: Atualizar `apps/site/app/page.tsx`**

Substituir:
```ts
import { categories } from "@/lib/menu-data";

export default function HomePage() {
  // ...
}
```

por:

```ts
import { getCategories } from "@/lib/menu-server";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await getCategories();
  // ... resto igual
}
```

> Preserve o restante do componente. Só muda: import + assinatura async + busca de categories.

- [ ] **Step 3: Atualizar `apps/site/app/[categoria]/page.tsx`**

Substituir:
```ts
import { categories, getCategoryBySlug } from "@/lib/menu-data";

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.id }));
}
```

por:

```ts
import { getCategories, getCategoryBySlug } from "@/lib/menu-server";

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ categoria: c.id }));
}
```

E qualquer outra função que use `categories` ou `getCategoryBySlug` precisa virar async (await as chamadas).

> Se `generateMetadata` ou o componente principal usam `getCategoryBySlug(params.categoria)`, é só adicionar `await`.

- [ ] **Step 4: Build seco**

```bash
pnpm site:build
```
Expected: build completa sem erros, gera todas as páginas estáticas pra cada categoria. Capturar últimas linhas pra report.

- [ ] **Step 5: Typecheck + commit**

```bash
pnpm --filter @kanpai/site exec tsc --noEmit
git add apps/site/app
git commit -m "feat(site): layout e pages leem categories do Supabase"
```

---

## Task 9: Limpar menu-data.ts (deletar array e função)

**Files:**
- Modify: `apps/site/lib/menu-data.ts`

> **Pré-requisito:** build da Task 8 passou.

- [ ] **Step 1: Editar `apps/site/lib/menu-data.ts`**

Reduzir o arquivo a:

```ts
// ============================================================================
// CARDÁPIO KANPAI BLUE · METADADOS DO RESTAURANTE
// ============================================================================
// O array de categorias / pratos vive no Supabase desde a Fase 3.
// Apenas o `restaurant` const e re-exports de tipos permanecem aqui.

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
```

Remova o array `categories` e a função `getCategoryBySlug` (ambos agora vivem em menu-server.ts).

- [ ] **Step 2: Build seco**

```bash
pnpm site:build
```
Expected: passa. Se algum componente ainda importa `categories` ou `getCategoryBySlug` de `menu-data`, build vai falhar com módulo não encontrado — corrija o import (deveria vir de menu-server, mas tipo continua em menu-types).

- [ ] **Step 3: Commit**

```bash
git add apps/site/lib/menu-data.ts
git commit -m "refactor(site): aposentar menu-data.ts como fonte de cardapio (mantem restaurant + tipos)"
```

---

## Task 10: Smoke + push

**Files:** nenhum

- [ ] **Step 1: Smoke local**

```bash
pnpm site:dev
```

Abrir `http://localhost:3000`. Cenários:
- Home renderiza as 10 categorias (chips/cards na ordem correta) com gradients reais.
- Click numa categoria (ex: Pizze) → mostra os pratos (16/17 ativos do seed).
- Voltar pra home → "Festival" tem destaque (featured).
- Buscar (lupa do header) → digitar "calabresa" → resultados aparecem.
- Click num resultado da busca → vai pra categoria correta.
- Cardápio executivo (URL: `/executivo`) mostra os 2 menus com entradas/principais/sobremesas.
- Festival Premium (URL: `/festival`) mostra botão "Ver itens" → modal abre com long_description + 4 seções.

Parar dev server.

- [ ] **Step 2: Push**

```bash
git push -u origin feat/site-le-supabase
```

- [ ] **Step 3: Confirmar com o usuário antes de PR**

---

## Critério de pronto (Fase 3)

- [ ] `pnpm site:build` passa.
- [ ] `pnpm --filter @kanpai/site exec tsc --noEmit` passa.
- [ ] Home mostra 10 categorias do banco.
- [ ] Categoria individual mostra pratos do banco.
- [ ] SearchBar funciona com os dados do banco.
- [ ] Modal do Festival Premium mostra long_description + sections do banco.
- [ ] Categoria Executivo mostra os 2 menus do banco.
- [ ] `menu-data.ts` reduzido a `restaurant` + re-exports de tipos.
- [ ] Edição feita no admin reflete no site após `revalidate: 60` (ou cache miss).

---

## Fora desse plano

- **Fase 4 — Analytics**: tabela de events + dashboard no admin.
- **Limpeza de scripts**: `scripts/seed-from-menu-data.ts` perde a função primária (menu-data não é mais fonte). Pode virar artefato histórico ou ser convertido em backup-snapshot.
- **Variantes no site**: hoje variants vivem no DB mas não são expostas. Quando o site precisar mostrar, expande Dish com `variants?: DishVariant[]`.
