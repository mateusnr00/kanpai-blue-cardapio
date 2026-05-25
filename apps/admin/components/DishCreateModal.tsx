"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { DishForm } from "./DishForm";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: CategoryListItem[];
  defaultCategoryId: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
  /** Disparado apenas em sucesso (apos toast). Modal fecha automaticamente. */
  onCreated: () => void;
  kindLabel: string;
};

export function DishCreateModal({
  open,
  onClose,
  categories,
  defaultCategoryId,
  onSubmit,
  onCreated,
  kindLabel,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Novo prato (${kindLabel})`}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        ref={scrollRef}
        className="my-4 w-full max-w-5xl overflow-hidden rounded-2xl bg-bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink-ghost bg-bg-surface px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">Novo prato</h2>
            <p className="truncate text-xs text-ink-muted">
              Sera adicionado como <strong className="font-medium text-ink">{kindLabel}</strong> deste menu.
              Nao aparece como item solto do cardapio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-ink-soft hover:bg-bg-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6">
          <DishForm
            mode="create"
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            onSubmit={onSubmit}
            onSuccess={onCreated}
            onCancel={onClose}
            embedded
            submitLabel="Criar e adicionar"
          />
        </div>
      </div>
    </div>
  );
}
