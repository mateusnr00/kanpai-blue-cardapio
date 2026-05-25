"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PencilSimple, SquaresFour } from "@phosphor-icons/react";
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="w-10">
        <div {...attributes} {...listeners}>
          <DragHandle />
        </div>
      </td>
      <td className="hidden w-28 sm:table-cell">
        <CategoryPreview gradient={cat.gradient} label={cat.name} imagePath={cat.image_path} />
      </td>
      <td>
        <div className="font-medium text-ink">{cat.name}</div>
        <div className="text-xs text-ink-muted">
          {cat.featured ? "Destaque · " : ""}#{cat.number} · {dishCount} prato{dishCount === 1 ? "" : "s"}
        </div>
        <div className="mt-1 font-mono text-[10px] text-ink-muted md:hidden">#{cat.id}</div>
      </td>
      <td className="hidden w-48 font-mono text-xs text-ink-muted md:table-cell">#{cat.id}</td>
      <td className="w-20">
        <CategoryToggleActive id={cat.id} active={cat.active} />
      </td>
      <td className="text-right">
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Link href={`/cards/${cat.id}`} className="admin-btn-ghost">
            <PencilSimple size={16} />
            Editar
          </Link>
          <CategoryDeleteButton id={cat.id} name={cat.name} dishCount={dishCount} />
        </div>
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
      <div className="admin-empty">
        <SquaresFour size={32} className="mx-auto mb-2 text-ink-faint" weight="duotone" />
        Nenhuma categoria. Crie a primeira em Nova categoria.
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th className="w-10" />
            <th className="hidden w-28 sm:table-cell">Preview</th>
            <th>Categoria</th>
            <th className="hidden w-48 md:table-cell">Slug</th>
            <th className="w-20">Ativo</th>
            <th className="text-right">Ações</th>
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
