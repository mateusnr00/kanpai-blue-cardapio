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
