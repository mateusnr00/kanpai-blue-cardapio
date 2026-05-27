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

function SortableDishRow({ dish }: { dish: DishListRow }) {
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
    <tr ref={setNodeRef} style={style}>
      <td className="w-10">
        <div {...attributes} {...listeners}>
          <DragHandle />
        </div>
      </td>
      <td className="w-14 sm:w-16">
        {img ? (
          <Image
            src={img}
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-ink-ghost sm:h-12 sm:w-12"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-muted text-ink-faint sm:h-12 sm:w-12">
            <ImageIcon size={20} />
          </div>
        )}
      </td>
      <td>
        <div className="font-medium text-ink">{dish.name}</div>
        {dish.description ? (
          <div className="line-clamp-1 max-w-xl text-xs text-ink-muted">{dish.description}</div>
        ) : null}
        <div className="mt-1 text-xs text-ink-muted sm:hidden">{dish.price ?? "-"}</div>
      </td>
      <td className="hidden w-28 whitespace-nowrap font-medium tabular-nums sm:table-cell">
        {dish.price ?? "-"}
      </td>
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

  // Detecta se a categoria usa subcategorias (>=1 prato com subcategory preenchido)
  const usesSubcategories = items.some((d) => d.subcategory);

  // Agrupa preservando a ordem: itens sem subcategoria primeiro (destaques/topo),
  // depois cada subcategoria na ordem em que aparece no array.
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
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th className="w-10" />
            <th className="w-14 sm:w-16">Foto</th>
            <th>Nome</th>
            <th className="hidden w-28 sm:table-cell">Preço</th>
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
