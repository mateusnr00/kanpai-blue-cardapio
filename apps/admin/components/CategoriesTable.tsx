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
    <article
      ref={setNodeRef}
      style={style}
      className="border-b border-ink-ghost/60 transition last:border-b-0 hover:bg-bg-muted/30"
    >
      <div className="flex items-start gap-3 p-3 sm:items-center sm:p-4">
        <div {...attributes} {...listeners} className="shrink-0 cursor-grab pt-0.5 sm:pt-0">
          <DragHandle />
        </div>

        <div className="hidden shrink-0 sm:block">
          <CategoryPreview gradient={cat.gradient} label={cat.name} imagePath={cat.image_path} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{cat.name}</p>
          <p className="text-xs text-ink-muted">
            {cat.featured ? "Destaque | " : ""}#{cat.number} | {dishCount} prato{dishCount === 1 ? "" : "s"}
          </p>
          <p className="mt-1 truncate font-mono text-[10px] text-ink-muted md:hidden">#{cat.id}</p>
        </div>

        <span className="hidden truncate font-mono text-xs text-ink-muted md:block md:max-w-[160px] lg:max-w-[220px]">
          #{cat.id}
        </span>

        <CategoryToggleActive id={cat.id} active={cat.active} />
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-ink-ghost/40 bg-bg-muted/30 px-3 py-1.5 sm:px-4">
        <Link href={`/cards/${cat.id}`} className="admin-btn-ghost">
          <PencilSimple size={16} />
          Editar
        </Link>
        <CategoryDeleteButton id={cat.id} name={cat.name} dishCount={dishCount} />
      </div>
    </article>
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
    <div className="admin-card overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {items.map((c) => (
            <SortableRow key={c.id} cat={c} dishCount={dishCounts[c.id] ?? 0} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
