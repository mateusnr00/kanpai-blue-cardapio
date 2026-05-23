# Fase 1C — Admin: Gestão de Cards (Categorias) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preencher `/admin/cards` com a lista real das 10 categorias do banco, com drag-reorder, toggle ativo, edição/criação/exclusão e gestão de subcategorias. Categoria edita: nome, número, descrição, item_count, detail, gradient (com preview), featured, subcategories. Slug (`id`) imutável após criação (é PK referenciada por dishes).

**Architecture:** Mesmo padrão da Fase 1B — Server Components pra dados, Server Actions pra mutações, Client Components onde precisa de estado. Reaproveita `ConfirmDialog`, `sonner`, `@dnd-kit`. Gradient editado como CSS string em textarea com preview ao vivo. Subcategories editadas como lista de chips com add/remove.

**Tech Stack:** Next.js 14 App Router, `@supabase/ssr`, `@kanpai/db`, `@dnd-kit/*`, `sonner`.

**Pré-requisito:** Fase 1B mergeada (componentes ConfirmDialog, padrões de actions, dnd-kit instalado).

---

## File Structure

**Novos:**
```
apps/admin/
├── app/(protected)/cards/
│   ├── page.tsx                              # MODIFICADO: lista de cards (era placeholder)
│   ├── actions.ts                            # NEW: create/update/delete/toggle/reorder de categories
│   ├── new/page.tsx                          # NEW: form de nova categoria
│   └── [id]/page.tsx                         # NEW: form de editar categoria
├── components/
│   ├── CategoryPreview.tsx                   # NEW: chip com gradiente real (preview visual)
│   ├── CategoryToggleActive.tsx              # NEW: toggle ativo
│   ├── CategoryDeleteButton.tsx              # NEW: delete com confirm (mostra "X pratos serao excluidos")
│   ├── CategoriesTable.tsx                   # NEW: tabela sortable de categorias
│   ├── CategoryForm.tsx                      # NEW: form de criar/editar
│   ├── GradientInput.tsx                     # NEW: textarea CSS com preview ao vivo
│   └── SubcategoriesEditor.tsx               # NEW: chips editaveis (add/remove)
```

**Modificados:**
- `apps/admin/lib/data/categories.ts`: adiciona `getCategory(id)`, `listCategoriesAll()` retornando todos os campos. Mantém `listCategoriesWithCounts()`.

---

## Task 1: Branch

- [ ] **Step 1**

```bash
git checkout main && git pull --ff-only origin main
git checkout -b feat/admin-cards
git status   # esperado: clean
```

---

## Task 2: Extender data layer de categorias

**Files:**
- Modify: `apps/admin/lib/data/categories.ts`

- [ ] **Step 1: Substituir conteúdo completo**

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

export type CategoryRow = {
  id: string;
  number: string;
  name: string;
  short_name: string | null;
  description: string;
  item_count: string | null;
  detail: string | null;
  gradient: string;
  featured: boolean;
  active: boolean;
  position: number;
  subcategories: string[];
};

export async function listCategoriesWithCounts(): Promise<CategoryListItem[]> {
  const supabase = createServerClient();

  const catsRes = await supabase
    .from("categories")
    .select("id, number, name, position")
    .order("position");
  if (catsRes.error) throw catsRes.error;

  const dishesRes = await supabase.from("dishes").select("category_id, active");
  if (dishesRes.error) throw dishesRes.error;

  const counts = new Map<string, { total: number; active: number }>();
  for (const d of dishesRes.data ?? []) {
    const c = counts.get(d.category_id) ?? { total: 0, active: 0 };
    c.total += 1;
    if (d.active) c.active += 1;
    counts.set(d.category_id, c);
  }

  return (catsRes.data ?? []).map((c) => ({
    id: c.id,
    number: c.number,
    name: c.name,
    position: c.position,
    total: counts.get(c.id)?.total ?? 0,
    active: counts.get(c.id)?.active ?? 0,
  }));
}

export async function listCategoriesAll(): Promise<CategoryRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, number, name, short_name, description, item_count, detail, gradient, featured, active, position, subcategories")
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getCategory(id: string): Promise<CategoryRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, number, name, short_name, description, item_count, detail, gradient, featured, active, position, subcategories")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function countDishesByCategory(id: string): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("dishes")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);
  if (error) throw error;
  return count ?? 0;
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/lib/data/categories.ts
git commit -m "feat(admin): extender data layer de categorias (getCategory, listAll, countDishes)"
```

---

## Task 3: Server actions de categories

**Files:**
- Create: `apps/admin/app/(protected)/cards/actions.ts`

- [ ] **Step 1: Criar arquivo**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || `categoria-${Date.now()}`;
}

function extractSubcategories(formData: FormData): string[] {
  return formData.getAll("subcategory").map((s) => String(s).trim()).filter(Boolean);
}

export async function toggleCategoryActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("categories")
    .update({ active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/cards");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  const supabase = createServerClient();
  // ON DELETE CASCADE no schema apaga dishes + dish_variants + sections + executivos juntos
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/cards");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderCategories(orderedIds: string[]) {
  const supabase = createServerClient();
  const updates = orderedIds.map((id, index) =>
    supabase.from("categories").update({ position: index }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) return { error: firstErr.message };
  revalidatePath("/cards");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createCategory(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const item_count = String(formData.get("item_count") ?? "").trim() || null;
  const detail = String(formData.get("detail") ?? "").trim() || null;
  const gradient = String(formData.get("gradient") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const subcategories = extractSubcategories(formData);

  if (!name || !number || !description || !gradient) {
    return { error: "Nome, número, descrição e gradient são obrigatórios." };
  }

  let id = String(formData.get("id") ?? "").trim();
  if (!id) id = slugify(name);

  const { data: maxRow } = await supabase
    .from("categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { error } = await supabase.from("categories").insert({
    id,
    number,
    name,
    short_name,
    description,
    item_count,
    detail,
    gradient,
    featured,
    active: true,
    position,
    subcategories,
  });

  if (error) return { error: error.message };

  revalidatePath("/cards");
  revalidatePath("/");
  redirect("/cards");
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const name = String(formData.get("name") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const item_count = String(formData.get("item_count") ?? "").trim() || null;
  const detail = String(formData.get("detail") ?? "").trim() || null;
  const gradient = String(formData.get("gradient") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const subcategories = extractSubcategories(formData);

  if (!name || !number || !description || !gradient) {
    return { error: "Nome, número, descrição e gradient são obrigatórios." };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      number,
      name,
      short_name,
      description,
      item_count,
      detail,
      gradient,
      featured,
      subcategories,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/cards");
  revalidatePath("/");
  redirect("/cards");
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/cards/actions.ts
git commit -m "feat(admin): server actions de categories (CRUD + toggle + reorder)"
```

---

## Task 4: CategoryPreview component

**Files:**
- Create: `apps/admin/components/CategoryPreview.tsx`

- [ ] **Step 1**

```tsx
type Props = {
  gradient: string;
  label: string;
};

/**
 * Chip com o gradiente real da categoria. Usado na lista e como preview no form.
 * Label fica truncada em ate 5 chars (espelhando o Nostra Admin).
 */
export function CategoryPreview({ gradient, label }: Props) {
  return (
    <span
      className="inline-flex h-8 w-20 items-center justify-center rounded-md text-[10px] font-medium uppercase tracking-wide text-white shadow-sm"
      style={{ background: gradient }}
    >
      {label.slice(0, 5)}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/CategoryPreview.tsx
git commit -m "feat(admin): CategoryPreview com gradient real"
```

---

## Task 5: CategoryToggleActive + CategoryDeleteButton

**Files:**
- Create: `apps/admin/components/CategoryToggleActive.tsx`
- Create: `apps/admin/components/CategoryDeleteButton.tsx`

- [ ] **Step 1: CategoryToggleActive**

```tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleCategoryActive } from "@/app/(protected)/cards/actions";

type Props = {
  id: string;
  active: boolean;
};

export function CategoryToggleActive({ id, active }: Props) {
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !active;
    startTransition(async () => {
      const res = await toggleCategoryActive(id, next);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success(next ? "Categoria ativada" : "Categoria desativada");
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
      aria-label={active ? "Desativar categoria" : "Ativar categoria"}
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

- [ ] **Step 2: CategoryDeleteButton**

```tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteCategory } from "@/app/(protected)/cards/actions";

type Props = {
  id: string;
  name: string;
  dishCount: number;
};

export function CategoryDeleteButton({ id, name, dishCount }: Props) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success("Categoria excluída");
      }
    });
  }

  const cascade =
    dishCount > 0
      ? ` Junto com ela, ${dishCount} prato${dishCount === 1 ? "" : "s"} será${dishCount === 1 ? "" : "ão"} excluído${dishCount === 1 ? "" : "s"}.`
      : "";

  return (
    <ConfirmDialog
      title="Excluir categoria"
      description={`Tem certeza que quer excluir "${name}"?${cascade} Esta ação não pode ser desfeita.`}
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
git add apps/admin/components/CategoryToggleActive.tsx apps/admin/components/CategoryDeleteButton.tsx
git commit -m "feat(admin): CategoryToggleActive + CategoryDeleteButton com aviso de cascade"
```

---

## Task 6: CategoriesTable (sortable)

**Files:**
- Create: `apps/admin/components/CategoriesTable.tsx`

- [ ] **Step 1**

```tsx
"use client";

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
import { CategoryPreview } from "./CategoryPreview";
import { CategoryToggleActive } from "./CategoryToggleActive";
import { CategoryDeleteButton } from "./CategoryDeleteButton";
import { reorderCategories } from "@/app/(protected)/cards/actions";
import type { CategoryRow } from "@/lib/data/categories";

type Props = {
  initial: CategoryRow[];
  dishCounts: Record<string, number>;
};

function SortableRow({ cat, dishCount }: { cat: CategoryRow; dishCount: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-ink-trace last:border-b-0">
      <td className="w-8 cursor-grab select-none py-3 pr-2 text-center text-ink-faint" {...attributes} {...listeners}>
        ⋮⋮
      </td>
      <td className="w-28 py-3 pr-3">
        <CategoryPreview gradient={cat.gradient} label={cat.name} />
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm font-medium">{cat.name}</div>
        <div className="text-xs text-ink-soft">
          {cat.featured ? "featured · " : ""}#{cat.number} · {dishCount} prato{dishCount === 1 ? "" : "s"}
        </div>
      </td>
      <td className="w-48 whitespace-nowrap py-3 pr-4 font-mono text-xs text-ink-soft">#{cat.id}</td>
      <td className="w-16 py-3 pr-3">
        <CategoryToggleActive id={cat.id} active={cat.active} />
      </td>
      <td className="w-32 py-3 pr-2 text-right">
        <Link
          href={`/cards/${cat.id}`}
          className="mr-3 rounded-md border border-ink-faint px-3 py-1 text-xs font-medium hover:border-ink"
        >
          Editar
        </Link>
        <CategoryDeleteButton id={cat.id} name={cat.name} dishCount={dishCount} />
      </td>
    </tr>
  );
}

export function CategoriesTable({ initial, dishCounts }: Props) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    startTransition(async () => {
      const res = await reorderCategories(next.map((c) => c.id));
      if ("error" in res) {
        toast.error(`Falha ao reordenar: ${res.error}`);
        setItems(initial);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
        Nenhuma categoria. Crie a primeira em + Nova categoria.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink-faint bg-bg-card">
      <table className="w-full text-sm">
        <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="w-28 px-2 py-2">Preview</th>
            <th className="py-2">Categoria</th>
            <th className="w-48 py-2">Slug</th>
            <th className="w-16 py-2">Ativo</th>
            <th className="w-32 py-2 text-right pr-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {items.map((c) => (
                <SortableRow key={c.id} cat={c} dishCount={dishCounts[c.id] ?? 0} />
              ))}
            </SortableContext>
          </DndContext>
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/CategoriesTable.tsx
git commit -m "feat(admin): CategoriesTable com drag-reorder"
```

---

## Task 7: /admin/cards page (substituir placeholder)

**Files:**
- Modify: `apps/admin/app/(protected)/cards/page.tsx`

- [ ] **Step 1: Substituir conteúdo**

```tsx
import Link from "next/link";
import { listCategoriesAll } from "@/lib/data/categories";
import { createServerClient } from "@/lib/supabase-server";
import { CategoriesTable } from "@/components/CategoriesTable";

async function countByCategory(): Promise<Record<string, number>> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("dishes").select("category_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const d of data ?? []) {
    counts[d.category_id] = (counts[d.category_id] ?? 0) + 1;
  }
  return counts;
}

export default async function CardsPage() {
  const [categories, dishCounts] = await Promise.all([
    listCategoriesAll(),
    countByCategory(),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cards da home</h1>
          <p className="text-xs text-ink-soft">
            {categories.length} categoria{categories.length === 1 ? "" : "s"} · arraste pra reordenar.
          </p>
        </div>
        <Link
          href="/cards/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Nova categoria
        </Link>
      </div>

      <CategoriesTable initial={categories} dishCounts={dishCounts} />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/cards/page.tsx
git commit -m "feat(admin): /cards lista categorias reais com drag-reorder"
```

---

## Task 8: GradientInput com preview ao vivo

**Files:**
- Create: `apps/admin/components/GradientInput.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useState } from "react";

type Props = {
  name: string;
  defaultValue: string;
};

const PRESETS: Array<{ label: string; value: string }> = [
  { label: "Azul Kanpai", value: "linear-gradient(135deg, #1A0E6E 0%, #2A1E8E 100%)" },
  { label: "Bege quente", value: "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)" },
  { label: "Rosê", value: "linear-gradient(135deg, #E8D4D8 0%, #C9A4A8 100%)" },
  { label: "Verde sereno", value: "linear-gradient(135deg, #C8D4C0 0%, #9AAA8E 100%)" },
];

export function GradientInput({ name, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 w-full rounded-md border border-ink-faint"
        style={{ background: value || "#fff" }}
      />
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        required
        spellCheck={false}
        placeholder="linear-gradient(135deg, #COR1 0%, #COR2 100%)"
        className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 font-mono text-xs"
      />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setValue(p.value)}
            className="rounded-md border border-ink-faint px-2 py-1 text-xs hover:border-ink"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/GradientInput.tsx
git commit -m "feat(admin): GradientInput com preview e presets"
```

---

## Task 9: SubcategoriesEditor

**Files:**
- Create: `apps/admin/components/SubcategoriesEditor.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useState } from "react";

type Props = {
  initial: string[];
};

export function SubcategoriesEditor({ initial }: Props) {
  const [items, setItems] = useState<string[]>(initial);
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      setInput("");
      return;
    }
    setItems([...items, trimmed]);
    setInput("");
  }

  function remove(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Subcategorias (chips do filtro)
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Ex: "Todos", "Quentes", "Frias". Aparecem como filtro acima da lista de pratos no site.
      </p>

      {/* Cada item vai pro server action como hidden input chamado "subcategory" */}
      {items.map((s) => (
        <input key={s} type="hidden" name="subcategory" value={s} />
      ))}

      <ul className="mb-3 flex flex-wrap gap-2">
        {items.map((s, idx) => (
          <li
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-faint bg-bg-card px-3 py-1 text-xs"
          >
            <span>{s}</span>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label={`Remover ${s}`}
              className="text-ink-soft hover:text-red-700"
            >
              ×
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-xs italic text-ink-soft">Nenhuma subcategoria.</li>
        ) : null}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Digite e Enter"
          className="flex-1 rounded-md border border-ink-faint bg-bg-card px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
        >
          + Adicionar
        </button>
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/admin/components/SubcategoriesEditor.tsx
git commit -m "feat(admin): SubcategoriesEditor com chips add/remove"
```

---

## Task 10: CategoryForm

**Files:**
- Create: `apps/admin/components/CategoryForm.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GradientInput } from "./GradientInput";
import { SubcategoriesEditor } from "./SubcategoriesEditor";
import type { CategoryRow } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: CategoryRow;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function CategoryForm({ mode, initial, onSubmit }: Props) {
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
        toast.success(mode === "create" ? "Categoria criada" : "Salvo");
      }
    });
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
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
          <label htmlFor="number" className="text-xs font-medium text-ink-soft">Número (ex: 01)</label>
          <input
            id="number"
            name="number"
            type="text"
            required
            defaultValue={initial?.number ?? ""}
            className="w-24 rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      {mode === "create" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="id" className="text-xs font-medium text-ink-soft">
            Slug (deixa vazio pra gerar do nome — imutável depois)
          </label>
          <input
            id="id"
            name="id"
            type="text"
            pattern="[a-z0-9-]+"
            placeholder="ex: festival"
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 font-mono text-sm"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Slug (imutável)</span>
          <code className="rounded-md border border-ink-faint bg-ink-trace px-3 py-2 font-mono text-sm">
            {initial?.id}
          </code>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium text-ink-soft">Descrição (microcopy do card)</label>
        <input
          id="description"
          name="description"
          type="text"
          required
          defaultValue={initial?.description ?? ""}
          placeholder='ex: "2 menus · principal experiência da casa"'
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="item_count" className="text-xs font-medium text-ink-soft">Item count (opcional)</label>
          <input
            id="item_count"
            name="item_count"
            type="text"
            defaultValue={initial?.item_count ?? ""}
            placeholder='ex: "2 menus"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail" className="text-xs font-medium text-ink-soft">Detalhe (opcional)</label>
          <input
            id="detail"
            name="detail"
            type="text"
            defaultValue={initial?.detail ?? ""}
            placeholder='ex: "começo da refeição"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="short_name" className="text-xs font-medium text-ink-soft">Nome curto (opcional)</label>
          <input
            id="short_name"
            name="short_name"
            type="text"
            defaultValue={initial?.short_name ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-soft">Gradient (CSS)</span>
        <GradientInput name="gradient" defaultValue={initial?.gradient ?? "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)"} />
      </div>

      <SubcategoriesEditor initial={initial?.subcategories ?? []} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
        Categoria em destaque (borda azul Kanpai + placeholder em gradiente azul)
      </label>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : mode === "create" ? "Criar categoria" : "Salvar"}
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

- [ ] **Step 2: Commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/CategoryForm.tsx
git commit -m "feat(admin): CategoryForm com gradient picker e subcategorias"
```

---

## Task 11: /cards/new + /cards/[id] pages

**Files:**
- Create: `apps/admin/app/(protected)/cards/new/page.tsx`
- Create: `apps/admin/app/(protected)/cards/[id]/page.tsx`

- [ ] **Step 1: /new**

```tsx
import Link from "next/link";
import { CategoryForm } from "@/components/CategoryForm";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <section className="flex flex-col gap-6">
      <Link href="/cards" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Nova categoria</h1>
      <CategoryForm mode="create" onSubmit={createCategory} />
    </section>
  );
}
```

- [ ] **Step 2: /[id]**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/data/categories";
import { CategoryForm } from "@/components/CategoryForm";
import { updateCategory } from "../../actions";

type Params = { id: string };

export default async function EditCategoryPage({ params }: { params: Params }) {
  const category = await getCategory(params.id);
  if (!category) notFound();

  async function onSubmit(formData: FormData) {
    "use server";
    return updateCategory(params.id, formData);
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href="/cards" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Editar: {category.name}</h1>
      <CategoryForm mode="edit" initial={category} onSubmit={onSubmit} />
    </section>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/cards
git commit -m "feat(admin): paginas /cards/new e /cards/[id] usando CategoryForm"
```

---

## Task 12: Build seco + smoke

**Files:** nenhum

- [ ] **Step 1: Build**

```bash
pnpm admin:build
```
Expected: build conclui sem erros. Captura últimas linhas pro relatório.

- [ ] **Step 2: Dev server (background)**

```bash
pnpm admin:dev
```

- [ ] **Step 3: Smoke manual**

Acessar `http://localhost:3001/cards` (logado). Cenários:
- Lista mostra 10 categorias com preview do gradient real.
- Click `Editar` em uma categoria → carrega form com valores preenchidos (gradient, descrição, subcategorias como chips).
- Editar nome ou número → salvar → toast "Salvo" → volta pra /cards → atualizado.
- Drag pra trocar ordem → F5 → ordem persistida.
- Click `+ Nova categoria` → form em branco → tentar submit vazio → erro inline.
- Preencher (slug "teste-1c", número "99", nome "Teste 1C", descrição "categoria de teste", deixar gradient default) → Criar categoria → volta pra /cards → "Teste 1C" no fim.
- Excluir "Teste 1C" → dialog mostra "0 pratos" → confirmar → toast → some.

Parar dev server.

- [ ] **Step 4: Não commitar — esta task é só verificação**

Se algum cenário falhou, STOP e BLOCKED com detalhes.

---

## Task 13: README + push

**Files:**
- Modify: `apps/admin/README.md`

- [ ] **Step 1: Atualizar seção Funcionalidades**

Inserir em "## Funcionalidades", após a linha sobre Badges, adicionar:

```markdown
- **`/admin/cards`**: gestão das categorias da home (preview com gradient, drag-reorder, toggle ativo, edição, exclusão com aviso de cascade).
- **`/admin/cards/new` e `/admin/cards/[id]`**: criar/editar categoria com gradient picker (presets + textarea CSS) e editor de subcategorias.
```

Substituir "## Próximo" por:

```markdown
## Próximo

Fase 2: editor de seções de detalhes (Festival) e editor de menus executivos.
```

- [ ] **Step 2: Commit + push**

```bash
git add apps/admin/README.md
git commit -m "docs(admin): documentar gestao de cards da Fase 1C"
git push -u origin feat/admin-cards
```

- [ ] **Step 3: Confirmar com usuário antes de PR**

---

## Critério de pronto (Fase 1C)

- [ ] `pnpm admin:build` passa.
- [ ] `pnpm --filter @kanpai/admin exec tsc --noEmit` passa.
- [ ] `/cards` lista 10 categorias com preview do gradient.
- [ ] Drag-reorder persiste após F5.
- [ ] Toggle ativo funciona.
- [ ] Editar categoria existente persiste mudanças.
- [ ] Criar nova categoria com slug auto-gerado funciona.
- [ ] Excluir categoria com pratos mostra aviso de cascade.
- [ ] Site público (`pnpm site:build`) continua passando.

---

## Próximos passos (fora desse plano)

- **Fase 2 — Estruturas especiais**: editor de `dish_detail_sections` (Festival) e editor de `executivo_menus` + `executivo_items`.
- **Fase 3 — Migração do site público**: site lê do Supabase em vez de `menu-data.ts`.
