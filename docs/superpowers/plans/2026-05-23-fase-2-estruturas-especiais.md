# Fase 2 — Estruturas Especiais (Festival sections + Executivo) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Habilitar edição das estruturas aninhadas do cardápio: (a) seções de detalhes de pratos com `long_description` (modal do Festival Premium), e (b) menus executivos com 3 listas (entradas/principais/sobremesas). Adiciona link "Editar detalhes" no DishForm pra pratos com seções, e expande a categoria Menu Executivo no admin com um editor dedicado.

**Architecture:** Editor de seções vive em `/admin/dishes/[id]/details` (separado do form principal de prato pra não inflar). Editor de executivos vive em `/admin/executivos/[id]` com listas drag-ordenáveis. Padrão de server actions, sortable, sonner já estabelecido nas Fases anteriores.

**Tech Stack:** Next.js 14 App Router, `@supabase/ssr`, `@kanpai/db`, `@dnd-kit/*`, `sonner`.

**Pré-requisito:** Fase 1C mergeada. Banco tem 138 pratos, 8 sections (Festival), 2 executivo_menus, 17 executivo_items do seed.

---

## File Structure

**Novos:**
```
apps/admin/
├── app/(protected)/
│   ├── dishes/[id]/details/
│   │   ├── page.tsx                          # NEW: editor de long_description + sections
│   │   └── actions.ts                        # NEW: saveLongDescription, syncSections
│   └── executivos/
│       ├── page.tsx                          # NEW: lista de executivos (todas categorias)
│       ├── new/page.tsx                      # NEW: form de novo executivo
│       ├── [id]/page.tsx                     # NEW: form de editar executivo + items
│       └── actions.ts                        # NEW: CRUD executivo + items
├── components/
│   ├── SectionsEditor.tsx                    # NEW: lista drag-ordenavel de {label, description}
│   ├── ExecutivoForm.tsx                     # NEW: form com 3 listas (entradas/principais/sobremesas)
│   ├── ExecutivoItemsList.tsx                # NEW: lista drag-ordenavel de items por kind
│   └── ExecutivoDeleteButton.tsx             # NEW: confirm + delete
├── lib/data/
│   ├── sections.ts                           # NEW: listSections(dishId)
│   └── executivos.ts                         # NEW: listExecutivos, getExecutivo, listExecutivoItems
```

**Modificados:**
- `apps/admin/components/DishForm.tsx`: add botão "Editar detalhes →" + campo `long_description` (textarea) — só mostrado em mode="edit"
- `apps/admin/components/AdminHeader.tsx`: add nav link "Executivos"

---

## Task 1: Branch

- [ ] **Step 1:**

```bash
git checkout main && git pull --ff-only origin main
git checkout -b feat/admin-estruturas-especiais
git status
```

Expected: clean tree.

---

## Task 2: Data layer — sections + executivos

**Files:**
- Create: `apps/admin/lib/data/sections.ts`
- Create: `apps/admin/lib/data/executivos.ts`

- [ ] **Step 1: sections.ts**

```ts
import { createServerClient } from "@/lib/supabase-server";

export type SectionRow = {
  id: string;
  label: string;
  description: string;
  position: number;
};

export async function listSections(dishId: string): Promise<SectionRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dish_detail_sections")
    .select("id, label, description, position")
    .eq("dish_id", dishId)
    .order("position");
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 2: executivos.ts**

```ts
import { createServerClient } from "@/lib/supabase-server";

export type ExecutivoRow = {
  id: string;
  category_id: string;
  name: string;
  price: string;
  format: string;
  description: string;
  validity: string | null;
  subcategory: string | null;
  position: number;
  active: boolean;
};

export type ExecutivoItemRow = {
  id: string;
  kind: "entrada" | "principal" | "sobremesa";
  name: string;
  description: string;
  price: string | null;
  position: number;
};

export async function listExecutivos(): Promise<Array<ExecutivoRow & { category_name: string }>> {
  const supabase = createServerClient();
  const exRes = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .order("position");
  if (exRes.error) throw exRes.error;

  const catRes = await supabase.from("categories").select("id, name");
  if (catRes.error) throw catRes.error;

  const catMap = new Map((catRes.data ?? []).map((c) => [c.id, c.name]));
  return (exRes.data ?? []).map((e) => ({ ...e, category_name: catMap.get(e.category_id) ?? "—" }));
}

export async function getExecutivo(id: string): Promise<ExecutivoRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("executivo_menus")
    .select("id, category_id, name, price, format, description, validity, subcategory, position, active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listExecutivoItems(executivoId: string): Promise<ExecutivoItemRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("executivo_items")
    .select("id, kind, name, description, price, position")
    .eq("executivo_id", executivoId)
    .order("kind")
    .order("position");
  if (error) throw error;
  return (data ?? []) as ExecutivoItemRow[];
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/lib/data
git commit -m "feat(admin): data layer de sections e executivos"
```

---

## Task 3: Server actions de sections

**Files:**
- Create: `apps/admin/app/(protected)/dishes/[id]/details/actions.ts`

- [ ] **Step 1**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase-server";

type SectionInput = { label: string; description: string };

function parseSections(formData: FormData): SectionInput[] {
  const count = Number(formData.get("sections_count") ?? "0");
  const out: SectionInput[] = [];
  for (let i = 0; i < count; i++) {
    const label = String(formData.get(`section_${i}_label`) ?? "").trim();
    const description = String(formData.get(`section_${i}_description`) ?? "").trim();
    if (label && description) out.push({ label, description });
  }
  return out;
}

export async function saveDishDetails(
  dishId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createServerClient();
  const longDescription = String(formData.get("long_description") ?? "").trim() || null;

  // Atualiza long_description no dish
  const { error: updErr } = await supabase
    .from("dishes")
    .update({ long_description: longDescription, updated_at: new Date().toISOString() })
    .eq("id", dishId);
  if (updErr) return { error: updErr.message };

  // delete+insert das sections (mesmo padrao das variants em Fase 1B)
  await supabase.from("dish_detail_sections").delete().eq("dish_id", dishId);

  const sections = parseSections(formData);
  if (sections.length > 0) {
    const rows = sections.map((s, i) => ({
      dish_id: dishId,
      label: s.label,
      description: s.description,
      position: i,
    }));
    const { error: insErr } = await supabase.from("dish_detail_sections").insert(rows);
    if (insErr) return { error: insErr.message };
  }

  revalidatePath(`/dishes/${dishId}`);
  revalidatePath(`/dishes/${dishId}/details`);
  revalidatePath("/");
  return {};
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/dishes/[id]/details/actions.ts
git commit -m "feat(admin): server action saveDishDetails (long_description + sections)"
```

---

## Task 4: SectionsEditor component

**Files:**
- Create: `apps/admin/components/SectionsEditor.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useState } from "react";
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
import type { SectionRow } from "@/lib/data/sections";

type LocalSection = {
  uid: string;       // chave local de React (estavel mesmo durante reordenacao)
  label: string;
  description: string;
};

function SortableSection({
  s,
  idx,
  onChange,
  onRemove,
}: {
  s: LocalSection;
  idx: number;
  onChange: (idx: number, field: "label" | "description", value: string) => void;
  onRemove: (idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.uid });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="rounded-md border border-ink-faint bg-bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab select-none text-ink-faint"
          aria-label="Arrastar seção"
        >
          ⋮⋮
        </button>
        <input
          type="text"
          name={`section_${idx}_label`}
          value={s.label}
          onChange={(e) => onChange(idx, "label", e.target.value)}
          placeholder="Título da seção (ex: Entradas Da Cozinha)"
          className="flex-1 rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm font-medium"
        />
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="text-xs font-medium text-red-700 hover:opacity-80"
        >
          Remover
        </button>
      </div>
      <textarea
        name={`section_${idx}_description`}
        value={s.description}
        onChange={(e) => onChange(idx, "description", e.target.value)}
        rows={3}
        placeholder="Conteúdo da seção"
        className="w-full rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm"
      />
    </li>
  );
}

type Props = {
  initial: SectionRow[];
};

export function SectionsEditor({ initial }: Props) {
  const [items, setItems] = useState<LocalSection[]>(
    initial.map((s, i) => ({ uid: s.id || `seed-${i}`, label: s.label, description: s.description }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function add() {
    setItems((prev) => [
      ...prev,
      { uid: `new-${Date.now()}-${prev.length}`, label: "", description: "" },
    ]);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function update(idx: number, field: "label" | "description", value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((s) => s.uid === active.id);
    const newIdx = items.findIndex((s) => s.uid === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setItems(arrayMove(items, oldIdx, newIdx));
  }

  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Seções (modal de detalhes)
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Cada seção aparece como bloco do modal "Ver itens". Use pra menus como Festival Premium.
      </p>

      <input type="hidden" name="sections_count" value={items.length} />

      {items.length === 0 ? (
        <p className="text-xs italic text-ink-soft">Nenhuma seção. Adicione abaixo pra ativar o modal.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((s) => s.uid)} strategy={verticalListSortingStrategy}>
              {items.map((s, idx) => (
                <SortableSection key={s.uid} s={s} idx={idx} onChange={update} onRemove={remove} />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
      >
        + Adicionar seção
      </button>
    </fieldset>
  );
}
```

- [ ] **Step 2: Commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/SectionsEditor.tsx
git commit -m "feat(admin): SectionsEditor com drag-reorder"
```

---

## Task 5: /admin/dishes/[id]/details page

**Files:**
- Create: `apps/admin/app/(protected)/dishes/[id]/details/page.tsx`

- [ ] **Step 1**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDish } from "@/lib/data/dishes";
import { listSections } from "@/lib/data/sections";
import { SectionsEditor } from "@/components/SectionsEditor";
import { DishDetailsForm } from "./DishDetailsForm";
import { saveDishDetails } from "./actions";

type Params = { id: string };

export default async function DishDetailsPage({ params }: { params: Params }) {
  const dish = await getDish(params.id);
  if (!dish) notFound();

  const sections = await listSections(dish.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return saveDishDetails(params.id, formData);
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href={`/dishes/${dish.id}`} className="text-xs text-ink-soft hover:text-ink">
        ← Voltar pro prato
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Detalhes de: {dish.name}</h1>
        <p className="text-xs text-ink-soft">
          Texto longo + seções aparecem no modal "Ver itens" do prato no cardápio.
        </p>
      </div>

      <DishDetailsForm
        initialLongDescription={dish.long_description ?? ""}
        initialSections={sections}
        onSubmit={onSubmit}
      />
    </section>
  );
}
```

- [ ] **Step 2: Criar `DishDetailsForm.tsx` no mesmo dir**

Cria `apps/admin/app/(protected)/dishes/[id]/details/DishDetailsForm.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SectionsEditor } from "@/components/SectionsEditor";
import type { SectionRow } from "@/lib/data/sections";

type Props = {
  initialLongDescription: string;
  initialSections: SectionRow[];
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function DishDetailsForm({ initialLongDescription, initialSections, onSubmit }: Props) {
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
        toast.success("Detalhes salvos");
      }
    });
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="long_description" className="text-xs font-medium text-ink-soft">
          Descrição longa (texto principal do modal)
        </label>
        <textarea
          id="long_description"
          name="long_description"
          rows={5}
          defaultValue={initialLongDescription}
          placeholder="Apresentação geral do menu/prato que aparece no topo do modal."
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <SectionsEditor initial={initialSections} />

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
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

- [ ] **Step 3: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/dishes/[id]/details
git commit -m "feat(admin): pagina /dishes/[id]/details com editor de long_description e sections"
```

---

## Task 6: Link "Editar detalhes" no DishForm (apenas mode=edit)

**Files:**
- Modify: `apps/admin/components/DishForm.tsx`

- [ ] **Step 1: Adicionar link no JSX**

Localize a seção `<VariantsEditor initial={variants} />` no `DishForm.tsx`. Insira ANTES dela, dentro do form, este bloco (apenas em mode=edit):

```tsx
{mode === "edit" && initial ? (
  <div className="flex items-center justify-between rounded-md border border-ink-faint bg-bg-card px-4 py-3">
    <div>
      <p className="text-sm font-medium">Detalhes (texto longo + seções)</p>
      <p className="text-xs text-ink-soft">
        Modal "Ver itens" no cardápio. Use pra Festival Premium e menus com mais texto.
      </p>
    </div>
    <a
      href={`/dishes/${initial.id}/details`}
      className="rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
    >
      Editar detalhes →
    </a>
  </div>
) : null}
```

> Use `<a>` em vez de `<Link>` pra forçar navegação completa — evita estado de form não-salvo persistindo. Se preferir `Link` do `next/link`, importe e use; ambos funcionam.

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/DishForm.tsx
git commit -m "feat(admin): link Editar detalhes no DishForm (mode=edit)"
```

---

## Task 7: Server actions de executivos

**Files:**
- Create: `apps/admin/app/(protected)/executivos/actions.ts`

- [ ] **Step 1**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

type ItemInput = {
  kind: "entrada" | "principal" | "sobremesa";
  name: string;
  description: string;
  price: string | null;
};

function parseItems(formData: FormData, kind: ItemInput["kind"]): ItemInput[] {
  const count = Number(formData.get(`${kind}_count`) ?? "0");
  const out: ItemInput[] = [];
  for (let i = 0; i < count; i++) {
    const name = String(formData.get(`${kind}_${i}_name`) ?? "").trim();
    const description = String(formData.get(`${kind}_${i}_description`) ?? "").trim();
    const priceRaw = String(formData.get(`${kind}_${i}_price`) ?? "").trim();
    if (!name) continue;
    out.push({
      kind,
      name,
      description,
      price: kind === "sobremesa" && priceRaw ? priceRaw : null,
    });
  }
  return out;
}

async function syncItems(executivoId: string, items: ItemInput[]) {
  const supabase = createServerClient();
  await supabase.from("executivo_items").delete().eq("executivo_id", executivoId);
  if (items.length === 0) return;

  // Numera position dentro de cada kind separadamente
  const counters: Record<ItemInput["kind"], number> = { entrada: 0, principal: 0, sobremesa: 0 };
  const rows = items.map((it) => ({
    executivo_id: executivoId,
    kind: it.kind,
    name: it.name,
    description: it.description,
    price: it.price,
    position: counters[it.kind]++,
  }));

  await supabase.from("executivo_items").insert(rows);
}

export async function toggleExecutivoActive(id: string, nextActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("executivo_menus")
    .update({ active: nextActive })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/executivos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteExecutivo(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("executivo_menus").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/executivos");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createExecutivo(formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const category_id = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const validity = String(formData.get("validity") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;

  if (!category_id || !name || !price || !format || !description) {
    return { error: "Categoria, nome, preço, formato e descrição obrigatórios." };
  }

  const { data: maxRow } = await supabase
    .from("executivo_menus")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("executivo_menus")
    .insert({
      category_id,
      name,
      price,
      format,
      description,
      validity,
      subcategory,
      position,
      active: true,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Falha ao criar." };

  const items = [
    ...parseItems(formData, "entrada"),
    ...parseItems(formData, "principal"),
    ...parseItems(formData, "sobremesa"),
  ];
  await syncItems(inserted.id, items);

  revalidatePath("/executivos");
  revalidatePath("/");
  redirect("/executivos");
}

export async function updateExecutivo(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = createServerClient();

  const category_id = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const validity = String(formData.get("validity") ?? "").trim() || null;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;

  if (!category_id || !name || !price || !format || !description) {
    return { error: "Categoria, nome, preço, formato e descrição obrigatórios." };
  }

  const { error } = await supabase
    .from("executivo_menus")
    .update({ category_id, name, price, format, description, validity, subcategory })
    .eq("id", id);

  if (error) return { error: error.message };

  const items = [
    ...parseItems(formData, "entrada"),
    ...parseItems(formData, "principal"),
    ...parseItems(formData, "sobremesa"),
  ];
  await syncItems(id, items);

  revalidatePath("/executivos");
  revalidatePath("/");
  redirect("/executivos");
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/executivos
git commit -m "feat(admin): server actions de executivos (CRUD + sync items por kind)"
```

---

## Task 8: ExecutivoItemsList component

**Files:**
- Create: `apps/admin/components/ExecutivoItemsList.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useState } from "react";
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
import type { ExecutivoItemRow } from "@/lib/data/executivos";

type Kind = "entrada" | "principal" | "sobremesa";

type LocalItem = {
  uid: string;
  name: string;
  description: string;
  price: string;  // sempre string no client; backend nulla pra entrada/principal
};

type Props = {
  kind: Kind;
  initial: ExecutivoItemRow[];
  title: string;
  showPrice?: boolean;
};

function SortableItem({
  it,
  idx,
  kind,
  showPrice,
  onChange,
  onRemove,
}: {
  it: LocalItem;
  idx: number;
  kind: Kind;
  showPrice?: boolean;
  onChange: (idx: number, field: "name" | "description" | "price", value: string) => void;
  onRemove: (idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: it.uid });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="rounded-md border border-ink-faint bg-bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-ink-faint" aria-label="Arrastar">⋮⋮</button>
        <input
          type="text"
          name={`${kind}_${idx}_name`}
          value={it.name}
          onChange={(e) => onChange(idx, "name", e.target.value)}
          placeholder="Nome do item"
          className="flex-1 rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm font-medium"
        />
        {showPrice ? (
          <input
            type="text"
            name={`${kind}_${idx}_price`}
            value={it.price}
            onChange={(e) => onChange(idx, "price", e.target.value)}
            placeholder="R$"
            className="w-24 rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm"
          />
        ) : null}
        <button type="button" onClick={() => onRemove(idx)} className="text-xs font-medium text-red-700 hover:opacity-80">
          Remover
        </button>
      </div>
      <textarea
        name={`${kind}_${idx}_description`}
        value={it.description}
        onChange={(e) => onChange(idx, "description", e.target.value)}
        rows={2}
        placeholder="Descrição do item"
        className="w-full rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm"
      />
    </li>
  );
}

export function ExecutivoItemsList({ kind, initial, title, showPrice }: Props) {
  const [items, setItems] = useState<LocalItem[]>(
    initial.map((it, i) => ({
      uid: it.id || `seed-${kind}-${i}`,
      name: it.name,
      description: it.description,
      price: it.price ?? "",
    }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function add() {
    setItems((p) => [...p, { uid: `new-${kind}-${Date.now()}-${p.length}`, name: "", description: "", price: "" }]);
  }
  function remove(idx: number) {
    setItems((p) => p.filter((_, i) => i !== idx));
  }
  function update(idx: number, field: "name" | "description" | "price", value: string) {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((it) => it.uid === active.id);
    const newIdx = items.findIndex((it) => it.uid === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setItems(arrayMove(items, oldIdx, newIdx));
  }

  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">{title}</legend>

      <input type="hidden" name={`${kind}_count`} value={items.length} />

      {items.length === 0 ? (
        <p className="text-xs italic text-ink-soft">Nenhum item ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((it) => it.uid)} strategy={verticalListSortingStrategy}>
              {items.map((it, idx) => (
                <SortableItem
                  key={it.uid}
                  it={it}
                  idx={idx}
                  kind={kind}
                  showPrice={showPrice}
                  onChange={update}
                  onRemove={remove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
      >
        + Adicionar
      </button>
    </fieldset>
  );
}
```

- [ ] **Step 2: Commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/ExecutivoItemsList.tsx
git commit -m "feat(admin): ExecutivoItemsList com drag-reorder por kind"
```

---

## Task 9: ExecutivoDeleteButton

**Files:**
- Create: `apps/admin/components/ExecutivoDeleteButton.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";
import { deleteExecutivo } from "@/app/(protected)/executivos/actions";

type Props = {
  id: string;
  name: string;
};

export function ExecutivoDeleteButton({ id, name }: Props) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteExecutivo(id);
      if ("error" in res) {
        toast.error(`Falha: ${res.error}`);
      } else {
        toast.success("Executivo excluído");
      }
    });
  }

  return (
    <ConfirmDialog
      title="Excluir executivo"
      description={`Tem certeza que quer excluir "${name}"? Os itens (entradas/principais/sobremesas) também serão removidos.`}
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

- [ ] **Step 2: Commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/ExecutivoDeleteButton.tsx
git commit -m "feat(admin): ExecutivoDeleteButton"
```

---

## Task 10: ExecutivoForm

**Files:**
- Create: `apps/admin/components/ExecutivoForm.tsx`

- [ ] **Step 1**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExecutivoItemsList } from "./ExecutivoItemsList";
import type { ExecutivoRow, ExecutivoItemRow } from "@/lib/data/executivos";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: ExecutivoRow;
  items?: ExecutivoItemRow[];
  categories: CategoryListItem[];
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function ExecutivoForm({ mode, initial, items = [], categories, onSubmit }: Props) {
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
        toast.success(mode === "create" ? "Executivo criado" : "Salvo");
      }
    });
  }

  const entradas = items.filter((it) => it.kind === "entrada");
  const principais = items.filter((it) => it.kind === "principal");
  const sobremesas = items.filter((it) => it.kind === "sobremesa");

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-ink-soft">Nome</label>
          <input
            id="name"
            name="name"
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
            defaultValue={initial?.category_id ?? categories[0]?.id ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-xs font-medium text-ink-soft">Preço</label>
          <input
            id="price"
            name="price"
            required
            defaultValue={initial?.price ?? ""}
            placeholder='ex: "R$ 89,90"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="format" className="text-xs font-medium text-ink-soft">Formato</label>
          <input
            id="format"
            name="format"
            required
            defaultValue={initial?.format ?? ""}
            placeholder='ex: "Entrada + Principal"'
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className="text-xs font-medium text-ink-soft">Subcategoria (opcional)</label>
          <input
            id="subcategory"
            name="subcategory"
            defaultValue={initial?.subcategory ?? ""}
            className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium text-ink-soft">Descrição</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={initial?.description ?? ""}
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="validity" className="text-xs font-medium text-ink-soft">Validade (opcional)</label>
        <input
          id="validity"
          name="validity"
          defaultValue={initial?.validity ?? ""}
          placeholder='ex: "Segunda a sexta, 11h30 às 15h"'
          className="rounded-md border border-ink-faint bg-bg-card px-3 py-2 text-sm"
        />
      </div>

      <ExecutivoItemsList kind="entrada" initial={entradas} title="Entradas" />
      <ExecutivoItemsList kind="principal" initial={principais} title="Principais" />
      <ExecutivoItemsList kind="sobremesa" initial={sobremesas} title="Sobremesas" showPrice />

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando..." : mode === "create" ? "Criar executivo" : "Salvar"}
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
git add apps/admin/components/ExecutivoForm.tsx
git commit -m "feat(admin): ExecutivoForm com 3 listas drag-ordenaveis"
```

---

## Task 11: /admin/executivos pages

**Files:**
- Create: `apps/admin/app/(protected)/executivos/page.tsx`
- Create: `apps/admin/app/(protected)/executivos/new/page.tsx`
- Create: `apps/admin/app/(protected)/executivos/[id]/page.tsx`

- [ ] **Step 1: Lista**

`apps/admin/app/(protected)/executivos/page.tsx`:

```tsx
import Link from "next/link";
import { listExecutivos } from "@/lib/data/executivos";
import { ExecutivoDeleteButton } from "@/components/ExecutivoDeleteButton";

export default async function ExecutivosPage() {
  const executivos = await listExecutivos();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executivos</h1>
          <p className="text-xs text-ink-soft">
            {executivos.length} menu{executivos.length === 1 ? "" : "s"} executivo{executivos.length === 1 ? "" : "s"} cadastrado{executivos.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/executivos/new"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Novo executivo
        </Link>
      </div>

      {executivos.length === 0 ? (
        <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
          Nenhum executivo. Crie em + Novo executivo.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-ink-faint bg-bg-card">
          <table className="w-full text-sm">
            <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="py-2 pl-3">Nome</th>
                <th className="py-2">Categoria</th>
                <th className="w-24 py-2">Preço</th>
                <th className="w-32 py-2 text-right pr-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {executivos.map((ex) => (
                <tr key={ex.id} className="border-b border-ink-trace last:border-b-0">
                  <td className="py-3 pl-3">
                    <div className="text-sm font-medium">{ex.name}</div>
                    <div className="text-xs text-ink-soft">{ex.format}</div>
                  </td>
                  <td className="py-3 text-xs text-ink-soft">{ex.category_name}</td>
                  <td className="py-3 text-sm">{ex.price}</td>
                  <td className="py-3 pr-3 text-right">
                    <Link
                      href={`/executivos/${ex.id}`}
                      className="mr-3 rounded-md border border-ink-faint px-3 py-1 text-xs font-medium hover:border-ink"
                    >
                      Editar
                    </Link>
                    <ExecutivoDeleteButton id={ex.id} name={ex.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: New**

`apps/admin/app/(protected)/executivos/new/page.tsx`:

```tsx
import Link from "next/link";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { ExecutivoForm } from "@/components/ExecutivoForm";
import { createExecutivo } from "../actions";

export default async function NewExecutivoPage() {
  const categories = await listCategoriesWithCounts();

  return (
    <section className="flex flex-col gap-6">
      <Link href="/executivos" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Novo executivo</h1>
      <ExecutivoForm mode="create" categories={categories} onSubmit={createExecutivo} />
    </section>
  );
}
```

- [ ] **Step 3: Edit**

`apps/admin/app/(protected)/executivos/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import { getExecutivo, listExecutivoItems } from "@/lib/data/executivos";
import { ExecutivoForm } from "@/components/ExecutivoForm";
import { updateExecutivo } from "../actions";

type Params = { id: string };

export default async function EditExecutivoPage({ params }: { params: Params }) {
  const [categories, executivo] = await Promise.all([
    listCategoriesWithCounts(),
    getExecutivo(params.id),
  ]);

  if (!executivo) notFound();
  const items = await listExecutivoItems(executivo.id);

  async function onSubmit(formData: FormData) {
    "use server";
    return updateExecutivo(params.id, formData);
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href="/executivos" className="text-xs text-ink-soft hover:text-ink">← Voltar pra lista</Link>
      <h1 className="text-2xl font-semibold tracking-tight">Editar: {executivo.name}</h1>
      <ExecutivoForm
        mode="edit"
        initial={executivo}
        items={items}
        categories={categories}
        onSubmit={onSubmit}
      />
    </section>
  );
}
```

- [ ] **Step 4: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/app/(protected)/executivos
git commit -m "feat(admin): paginas /executivos (lista, new, edit)"
```

---

## Task 12: Link "Executivos" no AdminHeader

**Files:**
- Modify: `apps/admin/components/AdminHeader.tsx`

- [ ] **Step 1: Adicionar NavLink**

No `<nav>` do header, entre `<NavLink href="/cards">Cards</NavLink>` e `<NavLink href="/analytics">Analytics</NavLink>`, inserir:

```tsx
<NavLink href="/executivos">Executivos</NavLink>
```

- [ ] **Step 2: Typecheck + commit**

```bash
pnpm --filter @kanpai/admin exec tsc --noEmit
git add apps/admin/components/AdminHeader.tsx
git commit -m "feat(admin): link Executivos no header"
```

---

## Task 13: Build seco + smoke

**Files:** nenhum

- [ ] **Step 1: Build**

```bash
pnpm admin:build
```
Expected: build conclui sem erros. Capturar últimas linhas.

- [ ] **Step 2: Smoke (dev local)**

```bash
pnpm admin:dev
```

Cenários:
- `/admin` (Cardápio) sem regressão.
- Editar prato "Festival Premium" (slug `fest-fds`) → ver botão "Editar detalhes →" → click → carrega `/dishes/<uuid>/details` com long_description + 4 seções existentes.
- Editar uma seção → salvar → toast → voltar pro prato.
- `/admin/executivos` lista 2 executivos do seed.
- Editar "Executivo Contemporâneo" → ver 3 listas (Entradas, Principais, Sobremesas) com items do seed.
- Drag pra reordenar entrada → salvar → verificar persistência.
- Criar novo executivo de teste com 1 entrada + 1 principal → salvar → aparece na lista.
- Excluir executivo de teste → confirm → some.

Parar dev server.

> Se algum cenário falhou, BLOCKED.

---

## Task 14: README + push

**Files:**
- Modify: `apps/admin/README.md`

- [ ] **Step 1: Atualizar funcionalidades**

Em "## Funcionalidades", adicionar APÓS o último bullet:

```markdown
- **`/admin/dishes/[id]/details`**: editor de descrição longa + seções (modal "Ver itens" do cardápio, ex. Festival Premium).
- **`/admin/executivos`**: gestão de menus executivos com 3 listas drag-ordenáveis (entradas, principais, sobremesas com preço opcional).
```

Substituir "## Próximo":

```markdown
## Próximo

Fase 3: migrar o site público pra ler do Supabase em vez de `menu-data.ts`.
```

- [ ] **Step 2: Commit + push**

```bash
git add apps/admin/README.md
git commit -m "docs(admin): documentar editor de detalhes e executivos (Fase 2)"
git push -u origin feat/admin-estruturas-especiais
```

- [ ] **Step 3: Confirmar com usuário antes de PR**

---

## Critério de pronto (Fase 2)

- [ ] `pnpm admin:build` passa.
- [ ] `pnpm --filter @kanpai/admin exec tsc --noEmit` passa.
- [ ] `/admin/dishes/<uuid>/details` carrega long_description + sections do banco.
- [ ] Adicionar/reordenar/remover seção persiste.
- [ ] `/admin/executivos` lista os 2 executivos do seed.
- [ ] Edição preenche as 3 listas com items corretos por kind.
- [ ] Criar executivo + salvar funciona; aparece na lista.
- [ ] Excluir executivo remove cascade dos items.
- [ ] Header agora tem 4 links: Cardápio · Cards · Executivos · Analytics.
- [ ] Site público (`pnpm site:build`) continua passando.

---

## Fora desse plano

- **Fase 3 — Migração do site público**: cardápio aposenta `menu-data.ts` e lê do Supabase com `revalidate: 60`.
- **Fase 4 — Analytics**: tabelas de events + dashboard.
