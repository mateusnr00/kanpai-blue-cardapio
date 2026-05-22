# Fase 1B — Admin: CRUD de Pratos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preencher `/admin` com a lista real de pratos da categoria selecionada (138 pratos do seed), com chips de categoria + drag-reorder + toggle ativo, e habilitar form de criar/editar prato com upload de foto pro Storage, badges (checkboxes), e variantes (collapsible com add/remove). Resultado: admin loga, vê os pratos reais, edita, cria, exclui, reordena.

**Architecture:** Server Components pra dados (queries via `@kanpai/db`), Server Actions pra mutações (insert/update/delete/upload + revalidatePath), Client Components onde precisa de interação (chips, drag, toggle, form com state). Drag-reorder via `@dnd-kit/core` + `@dnd-kit/sortable`. Toasts via `sonner`. Upload feito via Server Action recebendo `FormData` + `File`, persistido em bucket `dish-images` com path `{dish_id}.{ext}`.

**Tech Stack:** Next.js 14 App Router, `@supabase/ssr`, `@kanpai/db`, `@dnd-kit/core`, `@dnd-kit/sortable`, `sonner`.

**Pré-requisito:** Fase 1A merged + seed do menu-data aplicado (10 categorias, 138 pratos).

---

## File Structure

**Novos:**
```
apps/admin/
├── app/(protected)/
│   ├── page.tsx                                # MODIFICADO: substitui placeholder pela lista
│   └── dishes/
│       ├── actions.ts                          # NEW: createDish, updateDish, deleteDish, toggleActive, reorderDishes
│       ├── new/page.tsx                        # NEW: form de novo prato
│       └── [id]/page.tsx                       # NEW: form de editar prato
├── components/
│   ├── CategoryChips.tsx                       # NEW: chips com contagem ativos/total
│   ├── DishesTable.tsx                         # NEW: tabela completa com dnd
│   ├── DishRow.tsx                             # NEW: row sortable
│   ├── DishToggleActive.tsx                    # NEW: toggle ativo (server action)
│   ├── DishForm.tsx                            # NEW: form reusable (new + edit)
│   ├── ImageUpload.tsx                         # NEW: upload + preview
│   ├── BadgeCheckboxes.tsx                     # NEW: 8 checkboxes
│   ├── VariantsEditor.tsx                      # NEW: collapsible com add/remove
│   ├── ConfirmDialog.tsx                       # NEW: confirmacao de delete
│   └── ToasterProvider.tsx                     # NEW: <Toaster /> da sonner
├── lib/
│   ├── data/
│   │   ├── categories.ts                       # NEW: listCategories, getCategoryCounts
│   │   └── dishes.ts                           # NEW: listDishes, getDish, listVariants
│   └── storage.ts                              # NEW: uploadDishImage, deleteDishImage
```

**Modificados:**
- `apps/admin/app/layout.tsx`: incluir `<ToasterProvider />`
- `apps/admin/app/(protected)/page.tsx`: substituir placeholder pela CategoryChips + DishesTable

---

## Task 1: Branch + deps

**Files:**
- Modify: `apps/admin/package.json`

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull --ff-only origin main
git checkout -b feat/admin-crud-pratos
```

- [ ] **Step 2: Adicionar dependências**

```bash
pnpm --filter @kanpai/admin add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner
```

Expected: 4 packages added. `apps/admin/package.json` agora lista `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `sonner` em dependencies.

- [ ] **Step 3: Verificar typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/package.json pnpm-lock.yaml
git commit -m "chore(admin): adicionar dnd-kit e sonner"
```

---

## Task 2: Toaster provider

**Files:**
- Create: `apps/admin/components/ToasterProvider.tsx`
- Modify: `apps/admin/app/layout.tsx`

- [ ] **Step 1: Criar `ToasterProvider.tsx`**

```tsx
"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: "#FBFAF6", color: "#1A0E6E", border: "1px solid rgba(26,14,110,0.18)" },
      }}
    />
  );
}
```

- [ ] **Step 2: Modificar `apps/admin/app/layout.tsx`**

Substituir o conteúdo de `<body>`:

```tsx
<body className="font-sans">
  <ToasterProvider />
  {children}
</body>
```

E adicionar o import no topo:

```tsx
import { ToasterProvider } from "@/components/ToasterProvider";
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/components/ToasterProvider.tsx apps/admin/app/layout.tsx
git commit -m "feat(admin): ToasterProvider via sonner"
```

---

## Task 3: Data layer — categories

**Files:**
- Create: `apps/admin/lib/data/categories.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { createServerClient } from "@/lib/supabase-server";

export type CategoryListItem = {
  id: string;
  number: string;
  name: string;
  position: number;
  total: number;
  active: number;
};

export async function listCategoriesWithCounts(): Promise<CategoryListItem[]> {
  const supabase = createServerClient();

  const [{ data: categories, error: catErr }, { data: dishes, error: dishErr }] = await Promise.all([
    supabase.from("categories").select("id, number, name, position").order("position"),
    supabase.from("dishes").select("category_id, active"),
  ]);

  if (catErr) throw catErr;
  if (dishErr) throw dishErr;

  const counts = new Map<string, { total: number; active: number }>();
  for (const d of dishes ?? []) {
    const c = counts.get(d.category_id) ?? { total: 0, active: 0 };
    c.total += 1;
    if (d.active) c.active += 1;
    counts.set(d.category_id, c);
  }

  return (categories ?? []).map((c) => ({
    id: c.id,
    number: c.number,
    name: c.name,
    position: c.position,
    total: counts.get(c.id)?.total ?? 0,
    active: counts.get(c.id)?.active ?? 0,
  }));
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/lib/data/categories.ts
git commit -m "feat(admin): data layer de categorias com contagem ativos/total"
```

---

## Task 4: Data layer — dishes

**Files:**
- Create: `apps/admin/lib/data/dishes.ts`

- [ ] **Step 1: Criar arquivo**

```ts
import { createServerClient } from "@/lib/supabase-server";

export type DishListRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string | null;
  image_path: string | null;
  active: boolean;
  position: number;
};

export type DishDetail = DishListRow & {
  category_id: string;
  unit: string | null;
  long_description: string | null;
  subcategory: string | null;
  featured: boolean;
  original_price: string | null;
  badges: string[];
};

export type DishVariantRow = {
  id: string;
  name: string;
  price: string;
  image_path: string | null;
  position: number;
};

export async function listDishesByCategory(categoryId: string): Promise<DishListRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dishes")
    .select("id, slug, name, description, price, image_path, active, position")
    .eq("category_id", categoryId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getDish(id: string): Promise<DishDetail | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dishes")
    .select(
      "id, slug, category_id, name, description, long_description, price, unit, subcategory, featured, original_price, image_path, active, position, badges"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listVariants(dishId: string): Promise<DishVariantRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dish_variants")
    .select("id, name, price, image_path, position")
    .eq("dish_id", dishId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/lib/data/dishes.ts
git commit -m "feat(admin): data layer de dishes (lista, detail, variants)"
```

---

## Task 5: Helper de URL pública do Storage

**Files:**
- Create: `apps/admin/lib/storage.ts`

- [ ] **Step 1: Criar arquivo (server actions ficam pra Task 12)**

```ts
const BUCKET = "dish-images";

export function publicImageUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const STORAGE_BUCKET = BUCKET;
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/lib/storage.ts
git commit -m "feat(admin): helper publicImageUrl pro bucket dish-images"
```

---

## Task 6: CategoryChips component

**Files:**
- Create: `apps/admin/components/CategoryChips.tsx`

- [ ] **Step 1: Criar componente client**

```tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  categories: CategoryListItem[];
};

export function CategoryChips({ categories }: Props) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("cat") ?? categories[0]?.id;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <Link
            key={cat.id}
            href={`/?cat=${cat.id}`}
            className={
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
              (active
                ? "border-ink bg-ink text-white"
                : "border-ink-faint bg-bg-card text-ink hover:border-ink")
            }
          >
            {cat.name} <span className="ml-1 opacity-70">{cat.active}/{cat.total}</span>
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/CategoryChips.tsx
git commit -m "feat(admin): CategoryChips com contagem por categoria"
```

---

## Task 7: Server actions — toggleActive + deleteDish + reorderDishes

**Files:**
- Create: `apps/admin/app/(protected)/dishes/actions.ts`

- [ ] **Step 1: Criar arquivo**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

export async function toggleDishActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("dishes")
    .update({ active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteDish(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderDishes(categoryId: string, orderedIds: string[]) {
  const supabase = createServerClient();
  // Aplica posicoes em sequencia — pequenas N (138 max) entao OK fazer batch de updates.
  const updates = orderedIds.map((id, index) =>
    supabase.from("dishes").update({ position: index }).eq("id", id).eq("category_id", categoryId)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  revalidatePath("/");
  return { ok: true as const };
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/dishes/actions.ts
git commit -m "feat(admin): server actions toggleActive, deleteDish, reorderDishes"
```

---

## Task 8: DishToggleActive

**Files:**
- Create: `apps/admin/components/DishToggleActive.tsx`

- [ ] **Step 1: Criar client component**

```tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleDishActive } from "@/app/(protected)/dishes/actions";

type Props = {
  id: string;
  active: boolean;
};

export function DishToggleActive({ id, active }: Props) {
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !active;
    startTransition(async () => {
      const res = await toggleDishActive(id, next);
      if ("error" in res) {
        toast.error(`Falha ao atualizar: ${res.error}`);
      } else {
        toast.success(next ? "Ativado" : "Desativado");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={
        "inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-50 " +
        (active ? "bg-ink" : "bg-ink-faint")
      }
      aria-pressed={active}
      aria-label={active ? "Desativar prato" : "Ativar prato"}
    >
      <span
        className={
          "inline-block h-4 w-4 rounded-full bg-white transition " +
          (active ? "translate-x-4" : "translate-x-0.5")
        }
      />
    </button>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/DishToggleActive.tsx
git commit -m "feat(admin): DishToggleActive com optimistic transition"
```

---

## Task 9: ConfirmDialog + delete wiring

**Files:**
- Create: `apps/admin/components/ConfirmDialog.tsx`
- Create: `apps/admin/components/DishDeleteButton.tsx`

- [ ] **Step 1: ConfirmDialog (componente genérico)**

```tsx
"use client";

import { useState } from "react";

type Props = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  pending,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-md border border-ink-faint bg-bg-warm p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-medium">{title}</h2>
            <p className="mt-2 text-xs text-ink-soft">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-md border border-ink-faint px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                disabled={pending}
                className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: DishDeleteButton**

```tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteDish } from "@/app/(protected)/dishes/actions";

type Props = {
  id: string;
  name: string;
};

export function DishDeleteButton({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteDish(id);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success("Prato excluído");
      }
    });
  }

  return (
    <ConfirmDialog
      title="Excluir prato"
      description={`Tem certeza que quer excluir "${name}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      pending={pending}
      onConfirm={onConfirm}
      trigger={
        <button
          type="button"
          className="text-xs font-medium text-red-700 transition hover:opacity-80"
        >
          Excluir
        </button>
      }
    />
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/ConfirmDialog.tsx apps/admin/components/DishDeleteButton.tsx
git commit -m "feat(admin): ConfirmDialog + DishDeleteButton"
```

---

## Task 10: DishesTable + DishRow (sem drag ainda)

**Files:**
- Create: `apps/admin/components/DishesTable.tsx`
- Create: `apps/admin/components/DishRow.tsx`

- [ ] **Step 1: DishRow**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { publicImageUrl } from "@/lib/storage";
import { DishToggleActive } from "./DishToggleActive";
import { DishDeleteButton } from "./DishDeleteButton";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  dish: DishListRow;
  dragHandle?: React.ReactNode;
};

export function DishRow({ dish, dragHandle }: Props) {
  const img = publicImageUrl(dish.image_path);
  return (
    <tr className="border-b border-ink-trace last:border-b-0">
      <td className="w-8 py-3 pr-2 text-ink-faint">{dragHandle}</td>
      <td className="w-16 py-3 pr-3">
        {img ? (
          <Image
            src={img}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-ink-ghost" />
        )}
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm font-medium uppercase tracking-tight">{dish.name}</div>
        {dish.description ? (
          <div className="line-clamp-1 max-w-xl text-xs text-ink-soft">{dish.description}</div>
        ) : null}
      </td>
      <td className="w-24 whitespace-nowrap py-3 pr-4 text-sm">{dish.price ?? "—"}</td>
      <td className="w-16 py-3 pr-3">
        <DishToggleActive id={dish.id} active={dish.active} />
      </td>
      <td className="w-32 py-3 pr-2 text-right">
        <Link
          href={`/dishes/${dish.id}`}
          className="mr-3 rounded-md border border-ink-faint px-3 py-1 text-xs font-medium hover:border-ink"
        >
          Editar
        </Link>
        <DishDeleteButton id={dish.id} name={dish.name} />
      </td>
    </tr>
  );
}
```

- [ ] **Step 2: DishesTable (server component, sem dnd ainda)**

```tsx
import { DishRow } from "./DishRow";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  dishes: DishListRow[];
};

export function DishesTable({ dishes }: Props) {
  if (dishes.length === 0) {
    return (
      <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
        Nenhum prato nesta categoria.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink-faint bg-bg-card">
      <table className="w-full text-sm">
        <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-16 px-2 py-2">Foto</th>
            <th className="py-2">Nome</th>
            <th className="w-24 py-2">Preço</th>
            <th className="w-16 py-2">Ativo</th>
            <th className="w-32 py-2 text-right pr-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((d) => (
            <DishRow key={d.id} dish={d} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/DishRow.tsx apps/admin/components/DishesTable.tsx
git commit -m "feat(admin): DishesTable + DishRow com toggle e delete"
```

---

## Task 11: /admin page com chips + tabela real

**Files:**
- Modify: `apps/admin/app/(protected)/page.tsx`

- [ ] **Step 1: Substituir o placeholder**

Conteúdo completo de `apps/admin/app/(protected)/page.tsx`:

```tsx
import Link from "next/link";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { listDishesByCategory } from "@/lib/data/dishes";
import { CategoryChips } from "@/components/CategoryChips";
import { DishesTable } from "@/components/DishesTable";

type SearchParams = { cat?: string };

export default async function CardapioPage({ searchParams }: { searchParams: SearchParams }) {
  const categories = await listCategoriesWithCounts();
  const selectedId = searchParams.cat ?? categories[0]?.id ?? "";
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  const dishes = selected ? await listDishesByCategory(selected.id) : [];

  return (
    <section className="flex flex-col gap-6">
      <CategoryChips categories={categories} />

      {selected ? (
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{selected.name}</h1>
            <p className="text-xs text-ink-soft">
              {selected.total} {selected.total === 1 ? "item" : "itens"} · {selected.active} ativo{selected.active === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href={`/dishes/new?cat=${selected.id}`}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Novo item
          </Link>
        </div>
      ) : null}

      <DishesTable dishes={dishes} />
    </section>
  );
}
```

- [ ] **Step 2: Smoke local — sobe dev e verifica que abre**

```bash
pnpm admin:dev
```
Em `http://localhost:3001`: logar, ver chips, click numa categoria muda lista, toggle alterna, excluir abre dialog. Não precisa testar todos os 138 pratos. Parar dev server depois.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/app/(protected)/page.tsx
git commit -m "feat(admin): /admin lista pratos reais da categoria selecionada"
```

---

## Task 12: Upload de imagens — server action + ImageUpload component

**Files:**
- Modify: `apps/admin/lib/storage.ts` (adiciona server actions)
- Create: `apps/admin/components/ImageUpload.tsx`

- [ ] **Step 1: Adicionar funções de upload em `apps/admin/lib/storage.ts`**

Conteúdo completo (substituir tudo):

```ts
"use server";

import { createServerClient as createSSR } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@kanpai/db";

const BUCKET = "dish-images";

export function publicImageUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const STORAGE_BUCKET = BUCKET;

function authedClient() {
  const cookieStore = cookies();
  return createSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );
}

export async function uploadDishImageAction(
  pathBase: string,
  file: File
): Promise<{ path: string } | { error: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "avif"].includes(ext) ? ext : "jpg";
  const path = `${pathBase}.${safeExt}`;

  const supabase = authedClient();
  const arrayBuf = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuf, { contentType: file.type || `image/${safeExt}`, upsert: true });

  if (error) return { error: error.message };
  return { path };
}

export async function deleteDishImageAction(path: string): Promise<{ ok: true } | { error: string }> {
  const supabase = authedClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return { error: error.message };
  return { ok: true };
}
```

> **Atenção:** o arquivo originalmente era um helper puro. Agora vira módulo de server actions (`"use server"`). `publicImageUrl` continua exportado e pode ser chamado de client. Em server components funciona porque é função sync.

- [ ] **Step 2: ImageUpload component**

```tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/storage";

type Props = {
  name: string;        // FormData name
  initialPath: string | null;
};

export function ImageUpload({ name, initialPath }: Props) {
  const [path, setPath] = useState<string | null>(initialPath);
  const [preview, setPreview] = useState<string | null>(publicImageUrl(initialPath));
  const fileRef = useRef<HTMLInputElement>(null);
  const removeRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (removeRef.current) removeRef.current.value = "false";
  }

  function onRemove() {
    setPreview(null);
    setPath(null);
    if (fileRef.current) fileRef.current.value = "";
    if (removeRef.current) removeRef.current.value = "true";
  }

  return (
    <div className="flex items-start gap-4">
      <div className="h-24 w-24 overflow-hidden rounded-md border border-ink-faint bg-bg-card">
        {preview ? (
          <Image
            src={preview}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
            sem foto
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onFile}
          className="text-xs"
        />
        {preview ? (
          <button
            type="button"
            onClick={onRemove}
            className="self-start text-xs font-medium text-red-700 hover:opacity-80"
          >
            Remover foto
          </button>
        ) : null}
        <input ref={removeRef} type="hidden" name={`${name}__remove`} defaultValue="false" />
        <input type="hidden" name={`${name}__current`} defaultValue={path ?? ""} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/lib/storage.ts apps/admin/components/ImageUpload.tsx
git commit -m "feat(admin): upload de imagens via server action + componente"
```

---

## Task 13: BadgeCheckboxes

**Files:**
- Create: `apps/admin/components/BadgeCheckboxes.tsx`

- [ ] **Step 1: Criar componente**

```tsx
"use client";

const BADGES = [
  "Vegetariano",
  "Frutos do mar",
  "Contém leite",
  "Contém glúten",
  "Uva",
  "Picante",
  "Com álcool",
  "Sem álcool",
  "Não compartilhável",
];

type Props = {
  initial: string[];
};

export function BadgeCheckboxes({ initial }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {BADGES.map((b) => {
        const checked = initial.includes(b);
        return (
          <label
            key={b}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-faint bg-bg-card px-3 py-1.5"
          >
            <input
              type="checkbox"
              name="badges"
              value={b}
              defaultChecked={checked}
              className="h-3 w-3"
            />
            <span className="text-xs">{b}</span>
          </label>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/BadgeCheckboxes.tsx
git commit -m "feat(admin): BadgeCheckboxes com 9 badges padrao"
```

---

## Task 14: VariantsEditor

**Files:**
- Create: `apps/admin/components/VariantsEditor.tsx`

- [ ] **Step 1: Criar componente**

```tsx
"use client";

import { useState } from "react";
import type { DishVariantRow } from "@/lib/data/dishes";

type Props = {
  initial: DishVariantRow[];
};

type LocalVariant = {
  id: string;       // pode ser tempid pra novos
  name: string;
  price: string;
  existing: boolean;
};

export function VariantsEditor({ initial }: Props) {
  const [variants, setVariants] = useState<LocalVariant[]>(
    initial.map((v) => ({ id: v.id, name: v.name, price: v.price, existing: true }))
  );
  const [open, setOpen] = useState(variants.length > 0);

  function addVariant() {
    setVariants((v) => [
      ...v,
      { id: `new-${Date.now()}-${v.length}`, name: "", price: "", existing: false },
    ]);
    setOpen(true);
  }

  function update(idx: number, field: "name" | "price", value: string) {
    setVariants((v) => v.map((x, i) => (i === idx ? { ...x, [field]: value } : x)));
  }

  function remove(idx: number) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Variantes (escolha de proteína, sabor, opção)
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Use quando o item tem opções de escolha com preços diferentes. Cada variante tem nome e preço próprio.
      </p>

      {/* Serializacao para o server action ler */}
      <input type="hidden" name="variants_count" value={variants.length} />

      {variants.length === 0 ? (
        <p className="text-xs italic text-ink-soft">Nenhuma variante.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {variants.map((v, idx) => (
            <li key={v.id} className="flex items-center gap-2">
              <input type="hidden" name={`variant_${idx}_id`} value={v.existing ? v.id : ""} />
              <input
                type="text"
                name={`variant_${idx}_name`}
                value={v.name}
                onChange={(e) => update(idx, "name", e.target.value)}
                placeholder="Nome"
                className="flex-1 rounded-md border border-ink-faint bg-bg-card px-2 py-1 text-sm"
              />
              <input
                type="text"
                name={`variant_${idx}_price`}
                value={v.price}
                onChange={(e) => update(idx, "price", e.target.value)}
                placeholder="R$ 0,00"
                className="w-28 rounded-md border border-ink-faint bg-bg-card px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs font-medium text-red-700 hover:opacity-80"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addVariant}
        className="mt-3 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
      >
        + Adicionar variante
      </button>
    </fieldset>
  );
}
```

> Variantes não suportam imagem dedicada nesse plano — pra encurtar escopo. Se precisar, vira fase própria.

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/VariantsEditor.tsx
git commit -m "feat(admin): VariantsEditor com add/remove inline"
```

---

## Task 15: Server actions de Dish — createDish + updateDish + slug helper

**Files:**
- Modify: `apps/admin/app/(protected)/dishes/actions.ts`

- [ ] **Step 1: Substituir conteúdo completo (mantém toggleActive, deleteDish, reorderDishes; adiciona slugify, createDish, updateDish, syncVariants, handleImage)**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { uploadDishImageAction, deleteDishImageAction } from "@/lib/storage";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `prato-${Date.now()}`;
}

export async function toggleDishActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("dishes")
    .update({ active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteDish(id: string) {
  const supabase = createServerClient();
  // limpa imagem se existir
  const { data: dish } = await supabase.from("dishes").select("image_path").eq("id", id).maybeSingle();
  if (dish?.image_path) await deleteDishImageAction(dish.image_path);
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderDishes(categoryId: string, orderedIds: string[]) {
  const supabase = createServerClient();
  const updates = orderedIds.map((id, index) =>
    supabase.from("dishes").update({ position: index }).eq("id", id).eq("category_id", categoryId)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  revalidatePath("/");
  return { ok: true as const };
}

type VariantInput = { id: string; name: string; price: string };

function parseVariants(formData: FormData): VariantInput[] {
  const count = Number(formData.get("variants_count") ?? "0");
  const out: VariantInput[] = [];
  for (let i = 0; i < count; i++) {
    const name = String(formData.get(`variant_${i}_name`) ?? "").trim();
    const price = String(formData.get(`variant_${i}_price`) ?? "").trim();
    const id = String(formData.get(`variant_${i}_id`) ?? "");
    if (name && price) out.push({ id, name, price });
  }
  return out;
}

async function syncVariants(dishId: string, variants: VariantInput[]) {
  const supabase = createServerClient();
  // estrategia simples: delete todos e reinsere (variantes nao tem state importante).
  await supabase.from("dish_variants").delete().eq("dish_id", dishId);
  if (variants.length === 0) return;
  const rows = variants.map((v, i) => ({
    dish_id: dishId,
    name: v.name,
    price: v.price,
    position: i,
  }));
  await supabase.from("dish_variants").insert(rows);
}

function extractBadges(formData: FormData): string[] {
  return formData.getAll("badges").map((b) => String(b));
}

async function handleImage(
  formData: FormData,
  prefix: "image",
  dishId: string,
  currentPath: string | null
): Promise<string | null> {
  const remove = String(formData.get(`${prefix}__remove`) ?? "false") === "true";
  const file = formData.get(prefix);

  if (remove) {
    if (currentPath) await deleteDishImageAction(currentPath);
    return null;
  }

  if (file instanceof File && file.size > 0) {
    if (currentPath) await deleteDishImageAction(currentPath);
    const res = await uploadDishImageAction(dishId, file);
    if ("error" in res) throw new Error(res.error);
    return res.path;
  }

  return currentPath;
}

export async function createDish(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = String(formData.get("price") ?? "").trim() || null;
  const originalPrice = String(formData.get("original_price") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const badges = extractBadges(formData);

  if (!name || !categoryId) return { error: "Nome e categoria obrigatórios." };

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(name);

  // Pega proxima posicao na categoria
  const { data: maxRow } = await supabase
    .from("dishes")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("dishes")
    .insert({
      slug,
      category_id: categoryId,
      name,
      description,
      price,
      original_price: originalPrice,
      subcategory,
      featured,
      badges,
      active: true,
      position,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Falha ao criar." };

  // imagem
  try {
    const newPath = await handleImage(formData, "image", inserted.id, null);
    if (newPath) {
      await supabase.from("dishes").update({ image_path: newPath }).eq("id", inserted.id);
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  // variantes
  const variants = parseVariants(formData);
  await syncVariants(inserted.id, variants);

  revalidatePath("/");
  redirect(`/?cat=${categoryId}`);
}

export async function updateDish(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const price = String(formData.get("price") ?? "").trim() || null;
  const originalPrice = String(formData.get("original_price") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;
  const featured = formData.get("featured") === "on";
  const badges = extractBadges(formData);

  if (!name || !categoryId) return { error: "Nome e categoria obrigatórios." };

  const { data: current } = await supabase
    .from("dishes")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  let imagePath: string | null = current?.image_path ?? null;
  try {
    imagePath = await handleImage(formData, "image", id, current?.image_path ?? null);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from("dishes")
    .update({
      category_id: categoryId,
      name,
      description,
      price,
      original_price: originalPrice,
      subcategory,
      featured,
      badges,
      image_path: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const variants = parseVariants(formData);
  await syncVariants(id, variants);

  revalidatePath("/");
  redirect(`/?cat=${categoryId}`);
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/dishes/actions.ts
git commit -m "feat(admin): server actions createDish e updateDish (com upload + variants)"
```

---

## Task 16: DishForm component (compartilhado new + edit)

**Files:**
- Create: `apps/admin/components/DishForm.tsx`

- [ ] **Step 1: Criar componente**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { BadgeCheckboxes } from "./BadgeCheckboxes";
import { VariantsEditor } from "./VariantsEditor";
import type { DishDetail, DishVariantRow } from "@/lib/data/dishes";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: DishDetail;
  variants?: DishVariantRow[];
  categories: CategoryListItem[];
  defaultCategoryId?: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function DishForm({ mode, initial, variants = [], categories, defaultCategoryId, onSubmit }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success(mode === "create" ? "Prato criado" : "Salvo");
      }
    });
  }

  const currentCategoryId = initial?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "";

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-ink-soft">Nome</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initial?.name ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category_id" className="text-xs font-medium text-ink-soft">Categoria</label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={currentCategoryId}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium text-ink-soft">Descrição</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-xs font-medium text-ink-soft">Preço (texto, ex: R$ 82,90)</label>
          <input
            id="price"
            name="price"
            type="text"
            defaultValue={initial?.price ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="original_price" className="text-xs font-medium text-ink-soft">Preço antes (promo, opcional)</label>
          <input
            id="original_price"
            name="original_price"
            type="text"
            defaultValue={initial?.original_price ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className="text-xs font-medium text-ink-soft">Subcategoria (opcional)</label>
          <input
            id="subcategory"
            name="subcategory"
            type="text"
            defaultValue={initial?.subcategory ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-soft">Foto</span>
        <ImageUpload name="image" initialPath={initial?.image_path ?? null} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-soft">Badges</span>
        <BadgeCheckboxes initial={initial?.badges ?? []} />
      </div>

      <VariantsEditor initial={variants} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
        Prato em destaque (linha cheia + badge DESTAQUE)
      </label>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : mode === "create" ? "Criar item" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-ink-faint px-4 py-2 text-sm font-medium hover:border-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/DishForm.tsx
git commit -m "feat(admin): DishForm com campos completos (foto, badges, variantes)"
```

---

## Task 17: /admin/dishes/new + /admin/dishes/[id]

**Files:**
- Create: `apps/admin/app/(protected)/dishes/new/page.tsx`
- Create: `apps/admin/app/(protected)/dishes/[id]/page.tsx`

- [ ] **Step 1: /new page**

```tsx
import Link from "next/link";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { DishForm } from "@/components/DishForm";
import { createDish } from "../actions";

export default async function NewDishPage({ searchParams }: { searchParams: { cat?: string } }) {
  const categories = await listCategoriesWithCounts();

  return (
    <section className="flex flex-col gap-6">
      <Link href="/" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Novo item</h1>
      <DishForm
        mode="create"
        categories={categories}
        defaultCategoryId={searchParams.cat}
        onSubmit={createDish}
      />
    </section>
  );
}
```

- [ ] **Step 2: /[id] edit page**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { getDish, listVariants } from "@/lib/data/dishes";
import { DishForm } from "@/components/DishForm";
import { updateDish } from "../../actions";

type Params = { id: string };

export default async function EditDishPage({ params }: { params: Params }) {
  const [categories, dish] = await Promise.all([
    listCategoriesWithCounts(),
    getDish(params.id),
  ]);

  if (!dish) notFound();
  const variants = await listVariants(dish.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return updateDish(params.id, formData);
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href="/" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Editar: {dish.name}</h1>
      <DishForm
        mode="edit"
        initial={dish}
        variants={variants}
        categories={categories}
        onSubmit={onSubmit}
      />
    </section>
  );
}
```

> O `onSubmit` em /[id] é uma função inline com `"use server"` que captura `params.id` — esse é o padrão Next 14 pra passar contexto pra um Server Action a partir de uma página.

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/dishes
git commit -m "feat(admin): paginas /dishes/new e /dishes/[id] usando DishForm"
```

---

## Task 18: Drag-reorder via dnd-kit

**Files:**
- Modify: `apps/admin/components/DishesTable.tsx`
- Create: `apps/admin/components/DishesTableSortable.tsx`

- [ ] **Step 1: Criar `DishesTableSortable.tsx`** (client component)

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { DishToggleActive } from "./DishToggleActive";
import { DishDeleteButton } from "./DishDeleteButton";
import { publicImageUrl } from "@/lib/storage";
import { reorderDishes } from "@/app/(protected)/dishes/actions";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  categoryId: string;
  initial: DishListRow[];
};

function SortableDishRow({ dish }: { dish: DishListRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dish.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const img = publicImageUrl(dish.image_path);

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-ink-trace last:border-b-0">
      <td
        className="w-8 cursor-grab select-none py-3 pr-2 text-center text-ink-faint"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </td>
      <td className="w-16 py-3 pr-3">
        {img ? (
          <Image src={img} alt="" width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-md bg-ink-ghost" />
        )}
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm font-medium uppercase tracking-tight">{dish.name}</div>
        {dish.description ? (
          <div className="line-clamp-1 max-w-xl text-xs text-ink-soft">{dish.description}</div>
        ) : null}
      </td>
      <td className="w-24 whitespace-nowrap py-3 pr-4 text-sm">{dish.price ?? "—"}</td>
      <td className="w-16 py-3 pr-3">
        <DishToggleActive id={dish.id} active={dish.active} />
      </td>
      <td className="w-32 py-3 pr-2 text-right">
        <Link
          href={`/dishes/${dish.id}`}
          className="mr-3 rounded-md border border-ink-faint px-3 py-1 text-xs font-medium hover:border-ink"
        >
          Editar
        </Link>
        <DishDeleteButton id={dish.id} name={dish.name} />
      </td>
    </tr>
  );
}

export function DishesTableSortable({ categoryId, initial }: Props) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((d) => d.id === active.id);
    const newIndex = items.findIndex((d) => d.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    startTransition(async () => {
      const res = await reorderDishes(categoryId, next.map((d) => d.id));
      if ("error" in res) {
        toast.error(`Falha ao reordenar: ${res.error}`);
        setItems(initial);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
        Nenhum prato nesta categoria.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink-faint bg-bg-card">
      <table className="w-full text-sm">
        <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-16 px-2 py-2">Foto</th>
            <th className="py-2">Nome</th>
            <th className="w-24 py-2">Preço</th>
            <th className="w-16 py-2">Ativo</th>
            <th className="w-32 py-2 text-right pr-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {items.map((d) => (
                <SortableDishRow key={d.id} dish={d} />
              ))}
            </SortableContext>
          </DndContext>
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Modificar `/admin` page pra usar `DishesTableSortable`**

Substituir `<DishesTable dishes={dishes} />` por:

```tsx
<DishesTableSortable categoryId={selected.id} initial={dishes} />
```

E ajustar o import no topo.

> `DishesTable.tsx` original fica como fallback para usos sem drag (não usado por agora; pode deletar se quiser, mas custo zero deixar).

- [ ] **Step 3: Smoke local — drag em 2 pratos, verificar persistência**

```bash
pnpm admin:dev
```
Em `/admin?cat=entradas`, arrastar prato 1 pra posição 3. F5. Confirmar ordem persistiu. Parar dev server.

- [ ] **Step 4: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/DishesTableSortable.tsx apps/admin/app/(protected)/page.tsx
git commit -m "feat(admin): drag-reorder de pratos via dnd-kit"
```

---

## Task 19: Smoke test end-to-end (Playwright manual)

**Files:** nenhum

> Quem executa: o controlador (Claude) ou o engenheiro humano, usando o admin no browser.

Cenários:
- [ ] Login → `/`
- [ ] Click em chip `Entradas` → lista mostra 19 pratos
- [ ] Toggle ativo em algum prato → toast "Desativado" → ao filtrar chip de novo, contador `ativos` decrementa
- [ ] Click `+ Novo item` → vai pra `/dishes/new?cat=<id>` → form preenchido com categoria correta
- [ ] Preencher nome, preço, descrição, marcar badge "Picante", adicionar 2 variantes (Pequeno R$ 30 + Grande R$ 50) → Criar item
- [ ] Volta pra `/`, prato novo aparece no final da lista da categoria
- [ ] Click Editar no novo prato → form mostra os dados, variantes carregadas
- [ ] Trocar nome, salvar → volta, nome atualizado
- [ ] Anexar foto, salvar → preview aparece, lista mostra thumb
- [ ] Excluir prato → dialog → confirmar → toast → some da lista
- [ ] Drag 2 pratos pra trocar ordem → F5 → ordem persistida

Se algo falhar, BLOCKED + descreve.

---

## Task 20: README + push

**Files:**
- Modify: `apps/admin/README.md`

- [ ] **Step 1: Adicionar seção "Funcionalidades (Fase 1B)" no README**

Inserir após "## Auth", antes de "## Próximo":

```markdown
## Funcionalidades

- **`/admin` (Cardápio)**: chips de categoria com contagem `ativos/total`, tabela de pratos com foto, toggle ativo, drag-reorder, edição e exclusão.
- **`/admin/dishes/new`**: criar prato (nome, categoria, descrição, preço, foto, badges, variantes).
- **`/admin/dishes/[id]`**: editar prato com mesmo form.
- **Upload de fotos**: pro bucket `dish-images` no Storage, com preview e remoção.
- **Variantes**: nome + preço por variante, adicionar/remover inline.
- **Badges**: 9 opções (Vegetariano, Frutos do mar, Contém leite/glúten, Uva, Picante, Com/Sem álcool, Não compartilhável).
```

E substituir a seção "## Próximo" por:

```markdown
## Próximo

Fase 1C: gestão de categorias (página Cards).
```

- [ ] **Step 2: Push**

```bash
git push -u origin feat/admin-crud-pratos
```

- [ ] **Step 3: Confirmar com o usuário antes de abrir PR**

---

## Critério de pronto (Fase 1B)

- [ ] `pnpm admin:build` passa.
- [ ] `pnpm --filter @kanpai/admin exec tsc --noEmit` passa.
- [ ] `/admin` mostra os 10 chips, contagem correta.
- [ ] Selecionar categoria mostra pratos reais.
- [ ] Toggle ativo persiste e atualiza contagem ao filtrar de novo.
- [ ] Excluir prato pede confirmação e remove.
- [ ] Criar prato com foto + badge + 1 variante funciona, redireciona pra lista, prato aparece.
- [ ] Editar prato persiste mudanças incluindo trocar foto e adicionar/remover variantes.
- [ ] Drag-reorder persiste após F5.
- [ ] Site público (`pnpm site:build`) continua passando — não tocamos nele.

---

## Fora desse plano (próximos passos)

- **Fase 1C — Cards (categorias)**: editor de categorias com preview, gradiente, featured, drag-reorder.
- **Fase 2 — Estruturas especiais**: editor de `dish_detail_sections` (Festival) e `executivo_menus` + `executivo_items`.
- **Fase 3 — Site público lê do Supabase**: aposenta `menu-data.ts`.
