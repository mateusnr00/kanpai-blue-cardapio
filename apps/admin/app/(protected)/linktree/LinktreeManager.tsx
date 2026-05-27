"use client";

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
import { Plus, PencilSimple, Trash, Link as LinkIcon, FolderSimple, Prohibit } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmProvider";
import type { LinktreeNode } from "@/lib/data/linktree";
import {
  createButton,
  updateButton,
  deleteButton,
  reorderButtons,
  toggleButtonActive,
  type ButtonInput,
} from "./actions";

type Props = {
  initialTree: LinktreeNode[];
};

type EditTarget =
  | { mode: "create"; parentId: string | null }
  | { mode: "edit"; node: LinktreeNode };

function buttonKind(node: LinktreeNode): "link" | "subtree" | "disabled" {
  if (node.href) return "link";
  if (node.child_slug) return "subtree";
  return "disabled";
}

function KindChip({ kind }: { kind: "link" | "subtree" | "disabled" }) {
  if (kind === "link") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
        <LinkIcon size={10} weight="bold" />
        Link
      </span>
    );
  }
  if (kind === "subtree") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
        <FolderSimple size={10} weight="bold" />
        Sub-linktree
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-ghost/40 px-2 py-0.5 text-[10px] font-medium text-ink-soft">
      <Prohibit size={10} weight="bold" />
      Em breve
    </span>
  );
}

function SortableButtonCard({
  node,
  onEdit,
  onDelete,
  onToggle,
  onAddChild,
}: {
  node: LinktreeNode;
  onEdit: (n: LinktreeNode) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onAddChild: (parentId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const kind = buttonKind(node);
  const isSubtree = kind === "subtree";

  return (
    <li ref={setNodeRef} style={style} className="rounded-xl border border-ink-ghost bg-bg-card">
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-ink-faint hover:text-ink active:cursor-grabbing"
          aria-label="Arrastar"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
            <circle cx="3" cy="4" r="1.5" />
            <circle cx="9" cy="4" r="1.5" />
            <circle cx="3" cy="10" r="1.5" />
            <circle cx="9" cy="10" r="1.5" />
            <circle cx="3" cy="16" r="1.5" />
            <circle cx="9" cy="16" r="1.5" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-ink">{node.label}</p>
            <KindChip kind={kind} />
            {!node.active ? (
              <span className="text-[10px] uppercase tracking-wider text-ink-soft">inativo</span>
            ) : null}
          </div>
          <p className="truncate text-xs text-ink-muted">
            {node.href ? node.href : node.child_slug ? `/l/${node.child_slug}` : "sem destino"}
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center" title={node.active ? "Desativar" : "Ativar"}>
          <input
            type="checkbox"
            className="sr-only"
            checked={node.active}
            onChange={(e) => onToggle(node.id, e.target.checked)}
          />
          <span
            className={
              "relative inline-block h-5 w-9 rounded-full transition " +
              (node.active ? "bg-accent" : "bg-ink-ghost")
            }
          >
            <span
              className={
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition " +
                (node.active ? "left-[18px]" : "left-0.5")
              }
            />
          </span>
        </label>

        <button
          type="button"
          onClick={() => onEdit(node)}
          className="rounded-md p-1.5 text-ink-soft hover:bg-bg-muted hover:text-ink"
          aria-label="Editar"
        >
          <PencilSimple size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(node.id)}
          className="rounded-md p-1.5 text-ink-soft hover:bg-rose-50 hover:text-rose-600"
          aria-label="Excluir"
        >
          <Trash size={14} />
        </button>
      </div>

      {isSubtree ? (
        <div className="border-t border-ink-ghost bg-bg-muted/40 px-3 py-3">
          <ChildrenList
            parentId={node.id}
            children={node.children}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-ink-faint px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink"
          >
            <Plus size={12} weight="bold" />
            Adicionar botão em {node.label}
          </button>
        </div>
      ) : null}
    </li>
  );
}

function ChildrenList({
  parentId,
  children: childList,
  onEdit,
  onDelete,
  onToggle,
}: {
  parentId: string;
  children: LinktreeNode[];
  onEdit: (n: LinktreeNode) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [items, setItems] = useState(childList);

  // se props mudarem (apos revalidate), sincroniza
  if (
    items.length !== childList.length ||
    items.some((it, i) => it.id !== childList[i]?.id)
  ) {
    setItems(childList);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((it) => it.id === active.id);
    const newIdx = items.findIndex((it) => it.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    reorderButtons(parentId, next.map((n) => n.id)).then((r) => {
      if ("error" in r && r.error) toast.error(r.error);
    });
  }

  if (items.length === 0) {
    return <p className="text-xs italic text-ink-soft">Sem botões. Adicione abaixo.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((child) => (
            <SortableButtonCard
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddChild={() => {}}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function EditDialog({
  target,
  onClose,
  onSaved,
}: {
  target: EditTarget;
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = target.mode === "edit" ? target.node : null;
  const parentId = target.mode === "create" ? target.parentId : existing?.parent_id ?? null;
  const isChild = parentId !== null;

  const initialKind = existing ? buttonKind(existing) : "link";
  const [label, setLabel] = useState(existing?.label ?? "");
  const [kind, setKind] = useState<"link" | "subtree" | "disabled">(initialKind);
  const [href, setHref] = useState(existing?.href ?? "");
  const [childSlug, setChildSlug] = useState(existing?.child_slug ?? "");
  const [active, setActive] = useState(existing?.active ?? true);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!label.trim()) {
      toast.error("Label obrigatório.");
      return;
    }
    const payload: ButtonInput = {
      label: label.trim(),
      kind,
      href: kind === "link" ? href : undefined,
      childSlug: kind === "subtree" ? childSlug : undefined,
      parentId,
      active,
    };
    startTransition(async () => {
      const res =
        target.mode === "create"
          ? await createButton(payload)
          : await updateButton(existing!.id, payload);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(target.mode === "create" ? "Botão criado." : "Botão atualizado.");
      onSaved();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ink">
          {target.mode === "create" ? "Novo botão" : "Editar botão"}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="admin-label">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="admin-input"
            autoFocus
            placeholder="Ex: Cardápio · Flamboyant"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="admin-label">Tipo</span>
          <div className="grid grid-cols-3 gap-1">
            {(["link", "subtree", "disabled"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                disabled={isChild && k === "subtree"}
                title={isChild && k === "subtree" ? "Sub-linktrees só no nível raiz" : undefined}
                className={
                  "rounded-md border px-2 py-2 text-xs font-medium transition " +
                  (kind === k
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-ink-ghost bg-bg-card text-ink hover:border-ink") +
                  (isChild && k === "subtree" ? " opacity-40 cursor-not-allowed" : "")
                }
              >
                {k === "link" ? "Link" : k === "subtree" ? "Sub-linktree" : "Em breve"}
              </button>
            ))}
          </div>
        </div>

        {kind === "link" ? (
          <div className="flex flex-col gap-1.5">
            <label className="admin-label">URL</label>
            <input
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="admin-input"
              placeholder="/flamboyant  ou  https://..."
            />
            <p className="text-[11px] text-ink-soft">
              Interno (ex: /flamboyant) ou externo (https://...)
            </p>
          </div>
        ) : null}

        {kind === "subtree" ? (
          <div className="flex flex-col gap-1.5">
            <label className="admin-label">Slug da sub-página</label>
            <input
              type="text"
              value={childSlug}
              onChange={(e) => setChildSlug(e.target.value)}
              className="admin-input"
              placeholder="reservas (gera /l/reservas)"
            />
            <p className="text-[11px] text-ink-soft">
              Sem espaços. Vira a URL <code>/l/{childSlug || "..."}</code>. Vazio: gera do label.
            </p>
          </div>
        ) : null}

        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4"
          />
          Ativo (aparece no site)
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ink-ghost px-3 py-1.5 text-sm hover:border-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LinktreeManager({ initialTree }: Props) {
  const confirm = useConfirm();
  const [tree, setTree] = useState(initialTree);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [, startTransition] = useTransition();

  // sincroniza quando o server passa nova prop apos revalidate
  if (
    tree.length !== initialTree.length ||
    tree.some((n, i) => n.id !== initialTree[i]?.id)
  ) {
    setTree(initialTree);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = tree.findIndex((n) => n.id === active.id);
    const newIdx = tree.findIndex((n) => n.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(tree, oldIdx, newIdx);
    setTree(next);
    reorderButtons(null, next.map((n) => n.id)).then((r) => {
      if ("error" in r && r.error) toast.error(r.error);
    });
  }

  async function onDelete(id: string) {
    const ok = await confirm({
      title: "Excluir botão",
      description: "Excluir este botão? Sub-botões vinculados também serão removidos.",
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const r = await deleteButton(id);
      if (r.error) toast.error(r.error);
      else toast.success("Removido.");
    });
  }

  function onToggle(id: string, active: boolean) {
    startTransition(async () => {
      const r = await toggleButtonActive(id, active);
      if (r.error) toast.error(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditTarget({ mode: "create", parentId: null })}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white hover:opacity-90"
        >
          <Plus size={12} weight="bold" />
          Novo botão
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tree.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-3">
            {tree.map((node) => (
              <SortableButtonCard
                key={node.id}
                node={node}
                onEdit={(n) => setEditTarget({ mode: "edit", node: n })}
                onDelete={onDelete}
                onToggle={onToggle}
                onAddChild={(parentId) => setEditTarget({ mode: "create", parentId })}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {editTarget ? (
        <EditDialog
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => setEditTarget(null)}
        />
      ) : null}
    </div>
  );
}
