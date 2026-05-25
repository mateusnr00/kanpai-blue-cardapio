"use client";

import { useState } from "react";
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
import { DragHandle } from "./DragHandle";
import type { ExecutivoItemRow } from "@/lib/data/executivos";

type Kind = "entrada" | "principal" | "sobremesa";

type LocalItem = {
  uid: string;
  name: string;
  description: string;
  price: string;
};

type Props = {
  kind: Kind;
  initial: ExecutivoItemRow[];
  title: string;
  showPrice?: boolean;
};

function SortableItem({
  it,
  idx,
  kind,
  showPrice,
  onChange,
  onRemove,
}: {
  it: LocalItem;
  idx: number;
  kind: Kind;
  showPrice?: boolean;
  onChange: (idx: number, field: "name" | "description" | "price", value: string) => void;
  onRemove: (idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: it.uid });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="rounded-xl border border-ink-ghost bg-bg-muted/30 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          aria-label="Arrastar item"
        >
          <DragHandle />
        </button>
        <input
          type="text"
          name={`${kind}_${idx}_name`}
          value={it.name}
          onChange={(e) => onChange(idx, "name", e.target.value)}
          placeholder="Nome do item"
          className="admin-inline-input min-w-0 flex-1 font-medium"
        />
        {showPrice ? (
          <input
            type="text"
            name={`${kind}_${idx}_price`}
            value={it.price}
            onChange={(e) => onChange(idx, "price", e.target.value)}
            placeholder="R$"
            className="admin-inline-input w-20 sm:w-24"
          />
        ) : null}
        <button type="button" onClick={() => onRemove(idx)} className="admin-btn-ghost text-xs text-danger">
          Remover
        </button>
      </div>
      <textarea
        name={`${kind}_${idx}_description`}
        value={it.description}
        onChange={(e) => onChange(idx, "description", e.target.value)}
        rows={2}
        placeholder="Descrição do item"
        className="admin-inline-input w-full"
      />
    </li>
  );
}

export function ExecutivoItemsList({ kind, initial, title, showPrice }: Props) {
  const [items, setItems] = useState<LocalItem[]>(
    initial.map((it, i) => ({
      uid: it.id || `seed-${kind}-${i}`,
      name: it.name,
      description: it.description,
      price: it.price ?? "",
    }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function add() {
    setItems((p) => [...p, { uid: `new-${kind}-${Date.now()}-${p.length}`, name: "", description: "", price: "" }]);
  }
  function remove(idx: number) {
    setItems((p) => p.filter((_, i) => i !== idx));
  }
  function update(idx: number, field: "name" | "description" | "price", value: string) {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((it) => it.uid === active.id);
    const newIdx = items.findIndex((it) => it.uid === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setItems(arrayMove(items, oldIdx, newIdx));
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-fieldset-legend">{title}</legend>

      <input type="hidden" name={`${kind}_count`} value={items.length} />

      {items.length === 0 ? (
        <p className="text-xs italic text-ink-muted">Nenhum item ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((it) => it.uid)} strategy={verticalListSortingStrategy}>
              {items.map((it, idx) => (
                <SortableItem
                  key={it.uid}
                  it={it}
                  idx={idx}
                  kind={kind}
                  showPrice={showPrice}
                  onChange={update}
                  onRemove={remove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}

      <button type="button" onClick={add} className="admin-btn-secondary mt-4 text-xs">
        + Adicionar
      </button>
    </fieldset>
  );
}
