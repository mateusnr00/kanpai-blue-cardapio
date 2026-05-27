"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
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
import { reorderDishes } from "@/app/(protected)/dishes/actions";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  categoryId: string;
  initial: DishListRow[];
};

function SortableDishCard({ dish }: { dish: DishListRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dish.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const img = publicImageUrl(dish.image_path);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="border-b border-ink-ghost/60 transition last:border-b-0 hover:bg-bg-muted/30"
    >
      <div className="flex items-start gap-3 p-3 sm:items-center sm:p-4">
        <div {...attributes} {...listeners} className="shrink-0 cursor-grab pt-0.5 sm:pt-0">
          <DragHandle />
        </div>

        {img ? (
          <Image
            src={img}
            alt=""
            width={56}
            height={56}
            className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-ink-ghost sm:h-14 sm:w-14"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-muted text-ink-faint sm:h-14 sm:w-14">
            <ImageIcon size={20} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{dish.name}</p>
          {dish.description ? (
            <p className="line-clamp-1 text-xs text-ink-muted">{dish.description}</p>
          ) : null}
          {dish.price ? (
            <p className="mt-1 text-xs font-medium tabular-nums text-ink-muted sm:hidden">
              {dish.price}
            </p>
          ) : null}
        </div>

        {dish.price ? (
          <span className="hidden whitespace-nowrap text-sm font-medium tabular-nums text-ink sm:block">
            {dish.price}
          </span>
        ) : null}

        <DishToggleActive id={dish.id} active={dish.active} />
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-ink-ghost/40 bg-bg-muted/30 px-3 py-1.5 sm:px-4">
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

  return (
    <div className="admin-card overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {groups.map((g, gi) => (
            <div key={g.label ?? "_top"}>
              {usesSubcategories ? (
                <div
                  className={
                    "flex items-baseline justify-between gap-2 bg-bg-muted/60 px-3 py-2.5 sm:px-4 " +
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
