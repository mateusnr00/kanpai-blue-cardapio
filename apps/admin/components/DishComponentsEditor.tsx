"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash, MagnifyingGlass, Sparkle, PencilSimple, Image as ImageIcon } from "@phosphor-icons/react";
import { publicImageUrl } from "@/lib/storage";
import type { DishComponentRow } from "@/lib/data/dishes";
import type { CategoryListItem } from "@/lib/data/categories";
import { createDishForComponent } from "@/app/(protected)/dishes/actions";
import { DishCreateModal } from "./DishCreateModal";
import { DishToggleActive } from "./DishToggleActive";

type Kind = "entrada" | "entrada_fria" | "principal" | "sobremesa";

type ChoiceItem = {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  price: string | null;
  active: boolean;
};

type LocalComponent = {
  childId: string;
  kind: Kind;
  name: string;
  image_path: string | null;
  price: string | null;
  active: boolean;
};

type Props = {
  initial: DishComponentRow[];
  /** Rótulos customizados por kind (vazio/ausente → usa o padrão). */
  initialLabels?: Record<string, string> | null;
  choices: ChoiceItem[];
  categories: CategoryListItem[];
  parentCategoryId: string;
};

const TAB_LABEL: Record<Kind, string> = {
  entrada: "Entradas",
  entrada_fria: "Entradas frias",
  principal: "Principais",
  sobremesa: "Sobremesas",
};

const TAB_ORDER: Kind[] = ["entrada", "entrada_fria", "principal", "sobremesa"];

function kindSingular(kind: Kind): string {
  return TAB_LABEL[kind].toLowerCase().slice(0, -1);
}

export function DishComponentsEditor({
  initial,
  initialLabels,
  choices: initialChoices,
  categories,
  parentCategoryId,
}: Props) {
  const [labels, setLabels] = useState<Record<Kind, string>>({
    entrada: initialLabels?.entrada ?? "",
    entrada_fria: initialLabels?.entrada_fria ?? "",
    principal: initialLabels?.principal ?? "",
    sobremesa: initialLabels?.sobremesa ?? "",
  });

  // Rótulo que efetivamente aparece (custom ou padrão).
  function tabLabel(kind: Kind): string {
    return labels[kind].trim() || TAB_LABEL[kind];
  }
  const [items, setItems] = useState<LocalComponent[]>(
    initial.map((c) => ({
      childId: c.childId,
      kind: c.kind,
      name: c.child.name,
      image_path: c.child.image_path,
      price: c.child.price,
      active: c.child.active,
    })),
  );
  const [choices, setChoices] = useState<ChoiceItem[]>(initialChoices);
  const [activeTab, setActiveTab] = useState<Kind>("entrada");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const pendingCreatedRef = useRef<ChoiceItem | null>(null);

  const itemsByKind = useMemo(() => {
    const map: Record<Kind, LocalComponent[]> = { entrada: [], entrada_fria: [], principal: [], sobremesa: [] };
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
        active: choice.active,
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
        active: created.active,
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
      {TAB_ORDER.map((kind) => (
        <input
          key={`label-${kind}`}
          type="hidden"
          name={`component_label_${kind}`}
          value={labels[kind].trim()}
        />
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
              {tabLabel(kind)}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Rótulo customizado do grupo ativo — como aparece no cardápio público. */}
      <label className="mb-3 flex flex-col gap-1">
        <span className="text-xs font-medium text-ink-soft">
          Título da etapa no cardápio
        </span>
        <input
          type="text"
          value={labels[activeTab]}
          onChange={(e) =>
            setLabels((prev) => ({ ...prev, [activeTab]: e.target.value }))
          }
          placeholder={TAB_LABEL[activeTab]}
          maxLength={40}
          className="w-full max-w-xs rounded-md border border-ink-faint bg-bg-card px-2.5 py-1.5 text-sm outline-none focus:border-ink"
        />
        <span className="text-[11px] text-ink-muted">
          Deixe em branco para usar o padrão “{TAB_LABEL[activeTab]}”.
        </span>
      </label>

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
                className="flex flex-col gap-2 rounded-md border border-ink-faint bg-bg-card p-2 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Link
                    href={`/dishes/${it.childId}`}
                    className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-ghost hover:ring-2 hover:ring-ink"
                    aria-label="Editar componente (adicionar foto)"
                    title={img ? "Editar componente" : "Adicionar foto"}
                  >
                    {img ? (
                      <Image src={img} alt="" width={48} height={48} className="h-12 w-12 object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-ink-faint" weight="duotone" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                    {it.price ? (
                      <p className="text-xs text-ink-muted tabular-nums">{it.price}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-1">
                  <span title={it.active ? "Ativo (visível no cardápio)" : "Inativo (escondido do cardápio)"}>
                    <DishToggleActive id={it.childId} active={it.active} />
                  </span>
                  <Link
                    href={`/dishes/${it.childId}`}
                    className="inline-flex items-center gap-1 rounded-md border border-ink-faint px-2 py-1 text-xs hover:border-ink"
                    aria-label="Editar componente"
                    title="Editar (incluindo foto)"
                  >
                    <PencilSimple size={14} />
                  </Link>
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
                placeholder={`Buscar prato pra ${tabLabel(activeTab).toLowerCase()}...`}
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
                            {c.category}{c.price ? ` | ${c.price}` : ""}
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
