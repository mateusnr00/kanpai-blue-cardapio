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
import type { SectionRow } from "@/lib/data/sections";

type LocalSection = {
  uid: string;
  label: string;
  description: string;
};

function SortableSection({
  s,
  idx,
  onChange,
  onRemove,
}: {
  s: LocalSection;
  idx: number;
  onChange: (idx: number, field: "label" | "description", value: string) => void;
  onRemove: (idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.uid });
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
          aria-label="Arrastar seção"
        >
          <DragHandle />
        </button>
        <input
          type="text"
          name={`section_${idx}_label`}
          value={s.label}
          onChange={(e) => onChange(idx, "label", e.target.value)}
          placeholder="Título da seção (ex: Entradas Da Cozinha)"
          className="admin-inline-input min-w-0 flex-1 font-medium"
        />
        <button type="button" onClick={() => onRemove(idx)} className="admin-btn-ghost text-xs text-danger">
          Remover
        </button>
      </div>
      <textarea
        name={`section_${idx}_description`}
        value={s.description}
        onChange={(e) => onChange(idx, "description", e.target.value)}
        rows={3}
        placeholder="Conteúdo da seção"
        className="admin-inline-input w-full"
      />
    </li>
  );
}

type Props = {
  initial: SectionRow[];
};

export function SectionsEditor({ initial }: Props) {
  const [items, setItems] = useState<LocalSection[]>(
    initial.map((s, i) => ({ uid: s.id || `seed-${i}`, label: s.label, description: s.description }))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function add() {
    setItems((prev) => [
      ...prev,
      { uid: `new-${Date.now()}-${prev.length}`, label: "", description: "" },
    ]);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function update(idx: number, field: "label" | "description", value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((s) => s.uid === active.id);
    const newIdx = items.findIndex((s) => s.uid === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setItems(arrayMove(items, oldIdx, newIdx));
  }

  return (
    <fieldset className="admin-fieldset">
      <legend className="admin-fieldset-legend">Seções (modal de detalhes)</legend>

      <p className="mb-4 text-xs text-ink-muted">
        Cada seção aparece como bloco do modal &quot;Ver itens&quot;. Use para menus como Festival Premium.
      </p>

      <input type="hidden" name="sections_count" value={items.length} />

      {items.length === 0 ? (
        <p className="text-xs italic text-ink-muted">Nenhuma seção. Adicione abaixo para ativar o modal.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((s) => s.uid)} strategy={verticalListSortingStrategy}>
              {items.map((s, idx) => (
                <SortableSection key={s.uid} s={s} idx={idx} onChange={update} onRemove={remove} />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}

      <button type="button" onClick={add} className="admin-btn-secondary mt-4 text-xs">
        + Adicionar seção
      </button>
    </fieldset>
  );
}
