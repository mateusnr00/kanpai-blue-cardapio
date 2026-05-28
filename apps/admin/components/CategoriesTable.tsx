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
import { useIsDesktop } from "@/lib/use-is-desktop";
import { reorderCategories } from "@/app/(protected)/cards/actions";
import type { CategoryRow } from "@/lib/data/categories";

type Props = {
  initial: CategoryRow[];
  dishCounts: Record<string, number>;
};

/** Desktop: linha de tabela. */
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
      <td className="w-28">
        <CategoryPreview gradient={cat.gradient} label={cat.name} imagePath={cat.image_path} />
      </td>
      <td>
        <div className="font-medium text-ink">{cat.name}</div>
        <div className="text-xs text-ink-muted">
          {cat.featured ? "Destaque | " : ""}#{cat.number} | {dishCount} prato{dishCount === 1 ? "" : "s"}
        </div>
      </td>
      <td className="hidden w-48 font-mono text-xs text-ink-muted lg:table-cell">#{cat.id}</td>
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

/** Mobile: card empilhado. */
function SortableCard({ cat, dishCount }: { cat: CategoryRow; dishCount: number }) {
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
      <div className="flex items-start gap-3 p-3">
        <div {...attributes} {...listeners} className="shrink-0 cursor-grab pt-0.5">
          <DragHandle />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{cat.name}</p>
          <p className="text-xs text-ink-muted">
            {cat.featured ? "Destaque | " : ""}#{cat.number} | {dishCount} prato{dishCount === 1 ? "" : "s"}
          </p>
        </div>

        <CategoryToggleActive id={cat.id} active={cat.active} />
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-ink-ghost/40 bg-bg-muted/30 px-3 py-1.5">
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
  const isDesktop = useIsDesktop();
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

  // ----- Desktop: tabela -----
  if (isDesktop) {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10" />
              <th className="w-28">Preview</th>
              <th>Categoria</th>
              <th className="hidden w-48 lg:table-cell">Slug</th>
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

  // ----- Mobile: cards -----
  return (
    <div className="admin-card overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {items.map((c) => (
            <SortableCard key={c.id} cat={c} dishCount={dishCounts[c.id] ?? 0} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
