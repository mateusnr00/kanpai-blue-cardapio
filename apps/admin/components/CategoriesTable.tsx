"use client";

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-ink-trace last:border-b-0">
      <td className="w-8 cursor-grab select-none py-3 pr-2 text-center text-ink-faint" {...attributes} {...listeners}>
        ⋮⋮
      </td>
      <td className="hidden w-28 py-3 pr-3 sm:table-cell">
        <CategoryPreview gradient={cat.gradient} label={cat.name} imagePath={cat.image_path} />
      </td>
      <td className="py-3 pr-3 sm:pr-4">
        <div className="text-sm font-medium">{cat.name}</div>
        <div className="text-xs text-ink-soft">
          {cat.featured ? "featured · " : ""}#{cat.number} · {dishCount} prato{dishCount === 1 ? "" : "s"}
        </div>
        <div className="mt-1 font-mono text-[10px] text-ink-soft md:hidden">#{cat.id}</div>
      </td>
      <td className="hidden w-48 whitespace-nowrap py-3 pr-4 font-mono text-xs text-ink-soft md:table-cell">#{cat.id}</td>
      <td className="w-16 py-3 pr-3">
        <CategoryToggleActive id={cat.id} active={cat.active} />
      </td>
      <td className="w-28 py-3 pr-2 text-right sm:w-32">
        <Link
          href={`/cards/${cat.id}`}
          className="mr-2 inline-block rounded-md border border-ink-faint px-2 py-1 text-xs font-medium hover:border-ink sm:mr-3 sm:px-3"
        >
          Editar
        </Link>
        <CategoryDeleteButton id={cat.id} name={cat.name} dishCount={dishCount} />
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
      <div className="rounded-md border border-ink-faint bg-bg-card p-6 text-sm text-ink-soft">
        Nenhuma categoria. Crie a primeira em + Nova categoria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-ink-faint bg-bg-card">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-ink-trace text-left text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-8 px-2 py-2"></th>
            <th className="hidden w-28 px-2 py-2 sm:table-cell">Preview</th>
            <th className="py-2">Categoria</th>
            <th className="hidden w-48 py-2 md:table-cell">Slug</th>
            <th className="w-16 py-2">Ativo</th>
            <th className="w-28 py-2 text-right pr-2 sm:w-32">Ações</th>
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
