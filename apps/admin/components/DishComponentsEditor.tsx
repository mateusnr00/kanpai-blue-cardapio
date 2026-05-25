"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { publicImageUrl } from "@/lib/storage";
import type { DishComponentRow } from "@/lib/data/dishes";
import type { CategoryListItem } from "@/lib/data/categories";
import { createDishForComponent } from "@/app/(protected)/dishes/actions";
import { DishCreateModal } from "./DishCreateModal";

type Kind = "entrada" | "principal" | "sobremesa";

type ChoiceItem = {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  price: string | null;
};

type LocalComponent = {
  childId: string;
  kind: Kind;
  name: string;
  image_path: string | null;
  price: string | null;
};

type Props = {
  initial: DishComponentRow[];
  choices: ChoiceItem[];
  categories: CategoryListItem[];
  parentCategoryId: string;
};

const TAB_LABEL: Record<Kind, string> = {
  entrada: "Entradas",
  principal: "Principais",
  sobremesa: "Sobremesas",
};

const TAB_ORDER: Kind[] = ["entrada", "principal", "sobremesa"];

function kindSingular(kind: Kind): string {
  return TAB_LABEL[kind].toLowerCase().slice(0, -1);
}

export function DishComponentsEditor({
  initial,
  choices: initialChoices,
  categories,
  parentCategoryId,
}: Props) {
  const [items, setItems] = useState<LocalComponent[]>(
    initial.map((c) => ({
      childId: c.childId,
      kind: c.kind,
      name: c.child.name,
      image_path: c.child.image_path,
      price: c.child.price,
    })),
  );
  const [choices, setChoices] = useState<ChoiceItem[]>(initialChoices);
  const [activeTab, setActiveTab] = useState<Kind>("entrada");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const pendingCreatedRef = useRef<ChoiceItem | null>(null);

  const itemsByKind = useMemo(() => {
    const map: Record<Kind, LocalComponent[]> = { entrada: [], principal: [], sobremesa: [] };
    for (const it of items) map[it.kind].push(it);
    return map;
  }, [items]);

  function add(choice: ChoiceItem) {
    if (items.some((it) => it.childId === choice.id && it.kind === activeTab)) {
      setPickerOpen(false);
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        childId: choice.id,
        kind: activeTab,
        name: choice.name,
        image_path: choice.image_path,
        price: choice.price,
      },
    ]);
    setPickerOpen(false);
    setQuery("");
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      if (next[target].kind !== next[idx].kind) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function handleCreateSubmit(formData: FormData): Promise<{ error?: string }> {
    const res = await createDishForComponent(formData);
    if ("error" in res) return { error: res.error };
    pendingCreatedRef.current = res.dish;
    return {};
  }

  function onCreated() {
    const created = pendingCreatedRef.current;
    pendingCreatedRef.current = null;
    if (!created) return;
    setChoices((prev) => [created, ...prev]);
    setItems((prev) => [
      ...prev,
      {
        childId: created.id,
        kind: activeTab,
        name: created.name,
        image_path: created.image_path,
        price: created.price,
      },
    ]);
    setCreateOpen(false);
    setPickerOpen(false);
  }

  const filteredChoices = useMemo(() => {
    const taken = new Set(items.filter((it) => it.kind === activeTab).map((it) => it.childId));
    const q = query
      .toLowerCase()
      .normalize("NFD")
      // eslint-disable-next-line no-misleading-character-class
      .replace(/[̀-ͯ]/g, "");
    return choices.filter((c) => {
      if (taken.has(c.id)) return false;
      if (!q) return true;
      const name = c.name
        .toLowerCase()
        .normalize("NFD")
        // eslint-disable-next-line no-misleading-character-class
        .replace(/[̀-ͯ]/g, "");
      const cat = c.category
        .toLowerCase()
        .normalize("NFD")
        // eslint-disable-next-line no-misleading-character-class
        .replace(/[̀-ͯ]/g, "");
      return name.includes(q) || cat.includes(q);
    });
  }, [choices, items, activeTab, query]);

  return (
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Pratos incluídos neste menu
      </legend>

      <p className="mb-3 text-xs text-ink-soft">
        Vincule pratos existentes como entradas, principais ou sobremesas. Útil pra menus executivos, combos e festivais.
      </p>

      {/* serialização pro server action */}
      <input type="hidden" name="components_count" value={items.length} />
      {items.map((it, idx) => (
        <span key={`${it.kind}-${it.childId}`}>
          <input type="hidden" name={`component_${idx}_id`} value={it.childId} />
          <input type="hidden" name={`component_${idx}_kind`} value={it.kind} />
        </span>
      ))}

      <div className="mb-3 flex gap-1">
        {TAB_ORDER.map((kind) => {
          const count = itemsByKind[kind].length;
          const isActive = kind === activeTab;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setActiveTab(kind)}
              className={
                "rounded-md px-3 py-1.5 text-xs font-medium transition " +
                (isActive
                  ? "bg-ink text-white"
                  : "border border-ink-faint bg-bg-card text-ink hover:border-ink")
              }
            >
              {TAB_LABEL[kind]}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {itemsByKind[activeTab].length === 0 ? (
        <p className="text-xs italic text-ink-soft">Nenhum item nessa etapa.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((it, idx) => {
            if (it.kind !== activeTab) return null;
            const img = publicImageUrl(it.image_path);
            return (
              <li
                key={`${it.kind}-${it.childId}`}
                className="flex items-center gap-3 rounded-md border border-ink-faint bg-bg-card p-2"
              >
                <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ink-ghost">
                  {img ? (
                    <Image src={img} alt="" width={48} height={48} className="h-12 w-12 object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                  {it.price ? (
                    <p className="text-xs text-ink-muted tabular-nums">{it.price}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="rounded-md border border-ink-faint px-2 py-1 text-xs hover:border-ink"
                    aria-label="Mover pra cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="rounded-md border border-ink-faint px-2 py-1 text-xs hover:border-ink"
                    aria-label="Mover pra baixo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="rounded-md border border-ink-faint px-2 py-1 text-xs text-red-700 hover:border-ink"
                    aria-label="Remover"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
        >
          <Plus size={14} weight="bold" />
          Adicionar {kindSingular(activeTab)}
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={categories.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium text-ink hover:border-ink disabled:opacity-50"
        >
          <Sparkle size={14} weight="bold" className="text-accent" />
          Criar novo prato
        </button>
      </div>

      {pickerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-bg-warm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-ink-faint px-4 py-3">
              <MagnifyingGlass size={16} className="text-ink-soft" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Buscar prato pra ${TAB_LABEL[activeTab].toLowerCase()}...`}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-xs text-ink-soft hover:text-ink"
              >
                Fechar
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setPickerOpen(false);
                setCreateOpen(true);
              }}
              disabled={categories.length === 0}
              className="flex items-center gap-2 border-b border-ink-faint bg-bg-card/40 px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-bg-card disabled:opacity-50"
            >
              <Sparkle size={14} weight="bold" className="text-accent" />
              Criar novo prato…
            </button>

            <ul className="flex-1 overflow-y-auto">
              {filteredChoices.length === 0 ? (
                <li className="px-4 py-6 text-center text-xs text-ink-muted">Nenhum prato encontrado.</li>
              ) : (
                filteredChoices.map((c) => {
                  const img = publicImageUrl(c.image_path);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => add(c)}
                        className="flex w-full items-center gap-3 border-b border-ink-trace px-4 py-2 text-left last:border-b-0 hover:bg-bg-card"
                      >
                        <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ink-ghost">
                          {img ? (
                            <Image src={img} alt="" width={40} height={40} className="h-10 w-10 object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                          <p className="truncate text-xs text-ink-muted">
                            {c.category}{c.price ? ` · ${c.price}` : ""}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}

      <DishCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        defaultCategoryId={parentCategoryId}
        onSubmit={handleCreateSubmit}
        onCreated={onCreated}
        kindLabel={kindSingular(activeTab)}
      />
    </fieldset>
  );
}
