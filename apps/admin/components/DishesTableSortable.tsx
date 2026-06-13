"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Image as ImageIcon, PencilSimple, Tray } from "@phosphor-icons/react";
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
import { DragHandle } from "./DragHandle";
import { DishToggleActive } from "./DishToggleActive";
import { DishDeleteButton } from "./DishDeleteButton";
import { publicImageUrl } from "@/lib/storage";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { reorderDishes } from "@/app/(protected)/dishes/actions";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  categoryId: string;
  initial: DishListRow[];
};

/** Chave estável da subcategoria (null = grupo "Destaques"). */
const gkey = (label: string | null) => label ?? "__nosub";

/** Desktop: linha de tabela. */
function SortableDishRow({ dish }: { dish: DishListRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dish.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    scrollMarginTop: 96,
  };
  const img = publicImageUrl(dish.image_path);

  return (
    <tr ref={setNodeRef} id={`dish-${dish.id}`} style={style}>
      <td className="w-10">
        <div {...attributes} {...listeners} className="cursor-grab" title="Arrastar prato">
          <DragHandle />
        </div>
      </td>
      <td className="w-16">
        {img ? (
          <Image
            src={img}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-ink-ghost"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-muted text-ink-faint">
            <ImageIcon size={20} />
          </div>
        )}
      </td>
      <td>
        <div className="font-medium text-ink">{dish.name}</div>
        {dish.description ? (
          <div className="line-clamp-1 max-w-xl text-xs text-ink-muted">{dish.description}</div>
        ) : null}
      </td>
      <td className="w-28 whitespace-nowrap font-medium tabular-nums">{dish.price ?? "-"}</td>
      <td className="w-20">
        <DishToggleActive id={dish.id} active={dish.active} />
      </td>
      <td className="text-right">
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Link href={`/dishes/${dish.id}`} className="admin-btn-ghost">
            <PencilSimple size={16} />
            Editar
          </Link>
          <DishDeleteButton id={dish.id} name={dish.name} />
        </div>
      </td>
    </tr>
  );
}

/** Desktop: cabeçalho de subcategoria — arrastável move a seção inteira. */
function SortableGroupHeaderRow({
  groupKey,
  label,
  count,
}: {
  groupKey: string;
  label: string;
  count: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `grp:${groupKey}`,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <tr ref={setNodeRef} style={style} className="bg-bg-muted/60">
      <td className="w-10">
        <div {...attributes} {...listeners} className="cursor-grab" title="Arrastar seção inteira">
          <DragHandle />
        </div>
      </td>
      <td colSpan={5} className="py-2.5">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {label}
          </span>
          <span className="text-[11px] tabular-nums text-ink-faint">
            {count} {count === 1 ? "item" : "itens"}
          </span>
        </div>
      </td>
    </tr>
  );
}

/** Mobile: card empilhado. */
function SortableDishCard({ dish }: { dish: DishListRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dish.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    scrollMarginTop: 96,
  };
  const img = publicImageUrl(dish.image_path);

  return (
    <article
      ref={setNodeRef}
      id={`dish-${dish.id}`}
      style={style}
      className="border-b border-ink-ghost/60 transition last:border-b-0 hover:bg-bg-muted/30"
    >
      <div className="flex items-start gap-3 p-3">
        <div {...attributes} {...listeners} className="shrink-0 cursor-grab pt-0.5" title="Arrastar prato">
          <DragHandle />
        </div>

        {img ? (
          <Image
            src={img}
            alt=""
            width={56}
            height={56}
            className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-ink-ghost"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-muted text-ink-faint">
            <ImageIcon size={20} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{dish.name}</p>
          {dish.description ? (
            <p className="line-clamp-1 text-xs text-ink-muted">{dish.description}</p>
          ) : null}
          {dish.price ? (
            <p className="mt-1 text-xs font-medium tabular-nums text-ink-muted">{dish.price}</p>
          ) : null}
        </div>

        <DishToggleActive id={dish.id} active={dish.active} />
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-ink-ghost/40 bg-bg-muted/30 px-3 py-1.5">
        <Link href={`/dishes/${dish.id}`} className="admin-btn-ghost">
          <PencilSimple size={16} />
          Editar
        </Link>
        <DishDeleteButton id={dish.id} name={dish.name} />
      </div>
    </article>
  );
}

/** Mobile: cabeçalho de subcategoria — arrastável move a seção inteira. */
function SortableGroupHeaderDiv({
  groupKey,
  label,
  count,
  withBorder,
}: {
  groupKey: string;
  label: string;
  count: number;
  withBorder: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `grp:${groupKey}`,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "flex items-center gap-2 bg-bg-muted/60 px-3 py-2.5 " +
        (withBorder ? "border-t border-ink-ghost/60" : "")
      }
    >
      <div {...attributes} {...listeners} className="shrink-0 cursor-grab" title="Arrastar seção inteira">
        <DragHandle />
      </div>
      <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </span>
      <span className="text-[11px] tabular-nums text-ink-faint">
        {count} {count === 1 ? "item" : "itens"}
      </span>
    </div>
  );
}

export function DishesTableSortable({ categoryId, initial }: Props) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const isDesktop = useIsDesktop();

  // Ao voltar de uma edição (redirect com #dish-<id>), rola até o prato editado
  // em vez de deixar a lista no topo. Re-corrige a posição até o layout assentar
  // (troca desktop/mobile, imagens, etc.) e para se o usuário rolar manualmente.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#dish-")) return;
    const id = hash.slice(1);

    let cancelled = false;
    let timer = 0;
    let prevAbs: number | null = null;
    let stable = 0;
    const startedAt = Date.now();

    const onUserScroll = () => {
      cancelled = true;
    };
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true });
    const removeListeners = () => {
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
    };

    const finish = () => {
      removeListeners();
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        /* noop */
      }
      if (cancelled) return;
      const el = document.getElementById(id);
      if (!el) return;
      const prevBg = el.style.backgroundColor;
      el.style.transition = "background-color 0.4s ease";
      el.style.backgroundColor = "rgba(99, 102, 241, 0.16)";
      window.setTimeout(() => {
        el.style.backgroundColor = prevBg;
      }, 1500);
    };

    const step = () => {
      if (cancelled) {
        removeListeners();
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        const absTop = Math.round(el.getBoundingClientRect().top + window.scrollY);
        el.scrollIntoView({ block: "center", behavior: "auto" });
        if (prevAbs !== null && Math.abs(absTop - prevAbs) <= 1) stable += 1;
        else stable = 0;
        prevAbs = absTop;
        if (stable >= 3) return finish();
      }
      if (Date.now() - startedAt > 2500) return finish();
      timer = window.setTimeout(step, 90);
    };

    timer = window.setTimeout(step, 60);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      removeListeners();
    };
  }, [isDesktop]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function persist(next: DishListRow[]) {
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
      <div className="admin-empty">
        <Tray size={32} className="mx-auto mb-2 text-ink-faint" weight="duotone" />
        Nenhum prato nesta categoria.
      </div>
    );
  }

  const usesSubcategories = items.some((d) => d.subcategory);

  const groups: Array<{ label: string | null; rows: DishListRow[] }> = [];
  if (usesSubcategories) {
    const seen = new Set<string | null>();
    for (const d of items) {
      const key = d.subcategory ?? null;
      if (!seen.has(key)) {
        seen.add(key);
        groups.push({ label: key, rows: [] });
      }
      groups.find((g) => g.label === key)!.rows.push(d);
    }
  } else {
    groups.push({ label: null, rows: items });
  }

  // IDs ordenáveis: header da seção (grp:<key>) + os pratos dela, na ordem atual.
  const sortableIds = usesSubcategories
    ? groups.flatMap((g) => [`grp:${gkey(g.label)}`, ...g.rows.map((d) => d.id)])
    : items.map((d) => d.id);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // Arrastou uma SEÇÃO (subcategoria) inteira.
    if (activeId.startsWith("grp:")) {
      const activeKey = activeId.slice(4);
      const overKey = overId.startsWith("grp:")
        ? overId.slice(4)
        : gkey(items.find((d) => d.id === overId)?.subcategory ?? null);
      const keys = groups.map((g) => gkey(g.label));
      const from = keys.indexOf(activeKey);
      const to = keys.indexOf(overKey);
      if (from < 0 || to < 0 || from === to) return;
      const reordered = arrayMove(groups, from, to);
      persist(reordered.flatMap((g) => g.rows));
      return;
    }

    // Arrastou um PRATO.
    let overDishId = overId;
    if (overId.startsWith("grp:")) {
      const gk = overId.slice(4);
      const first = items.find((d) => gkey(d.subcategory) === gk);
      if (!first) return;
      overDishId = first.id;
    }
    const oldIndex = items.findIndex((d) => d.id === activeId);
    const newIndex = items.findIndex((d) => d.id === overDishId);
    if (oldIndex < 0 || newIndex < 0) return;
    persist(arrayMove(items, oldIndex, newIndex));
  }

  // ----- Desktop: tabela -----
  if (isDesktop) {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10" />
              <th className="w-16">Foto</th>
              <th>Nome</th>
              <th className="w-28">Preço</th>
              <th className="w-20">Ativo</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              {groups.map((g) => (
                <tbody key={g.label ?? "_top"}>
                  {usesSubcategories ? (
                    <SortableGroupHeaderRow
                      groupKey={gkey(g.label)}
                      label={g.label ?? "Destaques"}
                      count={g.rows.length}
                    />
                  ) : null}
                  {g.rows.map((d) => (
                    <SortableDishRow key={d.id} dish={d} />
                  ))}
                </tbody>
              ))}
            </SortableContext>
          </DndContext>
        </table>
      </div>
    );
  }

  // ----- Mobile: cards -----
  return (
    <div className="admin-card overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {groups.map((g, gi) => (
            <div key={g.label ?? "_top"}>
              {usesSubcategories ? (
                <SortableGroupHeaderDiv
                  groupKey={gkey(g.label)}
                  label={g.label ?? "Destaques"}
                  count={g.rows.length}
                  withBorder={gi > 0}
                />
              ) : null}
              {g.rows.map((d) => (
                <SortableDishCard key={d.id} dish={d} />
              ))}
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
