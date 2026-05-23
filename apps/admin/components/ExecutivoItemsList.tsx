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
    <li ref={setNodeRef} style={style} className="rounded-md border border-ink-faint bg-bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-ink-faint" aria-label="Arrastar">⋮⋮</button>
        <input
          type="text"
          name={`${kind}_${idx}_name`}
          value={it.name}
          onChange={(e) => onChange(idx, "name", e.target.value)}
          placeholder="Nome do item"
          className="flex-1 rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm font-medium"
        />
        {showPrice ? (
          <input
            type="text"
            name={`${kind}_${idx}_price`}
            value={it.price}
            onChange={(e) => onChange(idx, "price", e.target.value)}
            placeholder="R$"
            className="w-24 rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm"
          />
        ) : null}
        <button type="button" onClick={() => onRemove(idx)} className="text-xs font-medium text-red-700 hover:opacity-80">
          Remover
        </button>
      </div>
      <textarea
        name={`${kind}_${idx}_description`}
        value={it.description}
        onChange={(e) => onChange(idx, "description", e.target.value)}
        rows={2}
        placeholder="Descrição do item"
        className="w-full rounded-md border border-ink-faint bg-bg-warm px-2 py-1 text-sm"
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
    <fieldset className="rounded-md border border-ink-faint p-4">
      <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">{title}</legend>

      <input type="hidden" name={`${kind}_count`} value={items.length} />

      {items.length === 0 ? (
        <p className="text-xs italic text-ink-soft">Nenhum item ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
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

      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-md border border-ink-faint px-3 py-1.5 text-xs font-medium hover:border-ink"
      >
        + Adicionar
      </button>
    </fieldset>
  );
}
