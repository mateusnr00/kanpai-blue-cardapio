"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Image as ImageIcon, PencilSimple, Plus } from "@phosphor-icons/react";
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
import { AnnouncementToggle } from "./AnnouncementToggle";
import { AnnouncementDeleteButton } from "./AnnouncementDeleteButton";
import { announcementStatus, describeSchedule, STATUS_META } from "@/lib/announcement-schedule";
import { reorderAnnouncements } from "@/app/(protected)/aviso/actions";
import type { AnnouncementRow } from "@/lib/data/announcements";

function Row({ a }: { a: AnnouncementRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: a.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const schedule = { start: a.schedule_start, end: a.schedule_end, daysOff: a.schedule_days_off };
  const meta = STATUS_META[announcementStatus(a.is_active, schedule)];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border-b border-ink-ghost/60 px-3 py-3 last:border-b-0"
    >
      <div {...attributes} {...listeners} className="shrink-0 cursor-grab" title="Arrastar (prioridade)">
        <DragHandle />
      </div>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bg-muted ring-1 ring-ink-ghost">
        {a.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image_url} alt="" className="h-14 w-14 object-cover" />
        ) : (
          <ImageIcon size={20} className="text-ink-faint" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">{a.name}</p>
          <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " + meta.className}>
            {meta.label}
          </span>
        </div>
        <p className="truncate text-xs text-ink-muted">{describeSchedule(schedule)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AnnouncementToggle id={a.id} active={a.is_active} />
        <Link href={`/aviso/${a.id}`} className="admin-btn-ghost">
          <PencilSimple size={16} />
          Editar
        </Link>
        <AnnouncementDeleteButton id={a.id} name={a.name} />
      </div>
    </div>
  );
}

export function AnnouncementsList({ initial }: { initial: AnnouncementRow[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i.id === active.id);
    const newI = items.findIndex((i) => i.id === over.id);
    if (oldI < 0 || newI < 0) return;
    const next = arrayMove(items, oldI, newI);
    setItems(next);
    startTransition(async () => {
      const res = await reorderAnnouncements(next.map((i) => i.id));
      if ("error" in res) {
        toast.error(`Falha ao reordenar: ${res.error}`);
        setItems(initial);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href="/aviso/new" className="admin-btn-primary">
          <Plus size={18} weight="bold" />
          Novo aviso
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">Nenhum aviso ainda. Crie o primeiro com &ldquo;Novo aviso&rdquo;.</div>
      ) : (
        <div className="admin-card overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((a) => (
                <Row key={a.id} a={a} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <p className="text-xs text-ink-muted">
        Quando vários estiverem ativos/programados ao mesmo tempo, o site mostra só o{" "}
        <strong>primeiro da lista</strong> — arraste para definir a prioridade.
      </p>
    </div>
  );
}
