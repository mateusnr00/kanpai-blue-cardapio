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
        <div {...attributes} {...listeners}>
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
        <div {...attributes} {...listeners} className="shrink-0 cursor-grab pt-0.5">
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

export function DishesTableSortable({ categoryId, initial }: Props) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const isDesktop = useIsDesktop();

  // Ao voltar de uma edição (redirect com #dish-<id>), rola até o prato editado
  // em vez de deixar a lista no topo. Destaque rápido pra localizar.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#dish-")) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(hash.slice(1));
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "auto" });
      const prev = el.style.backgroundColor;
      el.style.transition = "background-color 0.4s ease";
      el.style.backgroundColor = "rgba(99, 102, 241, 0.12)";
      window.setTimeout(() => {
        el.style.backgroundColor = prev;
      }, 1400);
    });
    return () => cancelAnimationFrame(raf);
  }, [isDesktop]);
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
            <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {groups.map((g) => (
                <tbody key={g.label ?? "_top"}>
                  {usesSubcategories ? (
                    <tr className="bg-bg-muted/60">
                      <td colSpan={6} className="py-2.5">
                        <div className="flex items-baseline justify-between gap-2 px-1">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                            {g.label ?? "Destaques"}
                          </span>
                          <span className="text-[11px] tabular-nums text-ink-faint">
                            {g.rows.length} {g.rows.length === 1 ? "item" : "itens"}
                          </span>
                        </div>
                      </td>
                    </tr>
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
        <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {groups.map((g, gi) => (
            <div key={g.label ?? "_top"}>
              {usesSubcategories ? (
                <div
                  className={
                    "flex items-baseline justify-between gap-2 bg-bg-muted/60 px-3 py-2.5 " +
                    (gi > 0 ? "border-t border-ink-ghost/60" : "")
                  }
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    {g.label ?? "Destaques"}
                  </span>
                  <span className="text-[11px] tabular-nums text-ink-faint">
                    {g.rows.length} {g.rows.length === 1 ? "item" : "itens"}
                  </span>
                </div>
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
