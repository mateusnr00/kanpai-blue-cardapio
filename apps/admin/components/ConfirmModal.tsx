"use client";

import { useEffect } from "react";
import { WarningCircle, X } from "@phosphor-icons/react";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/20 px-6 backdrop-blur-sm"
      onClick={() => {
        if (!pending) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-ink-ghost bg-bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div
              className={
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                (isDanger ? "bg-danger-soft" : "bg-accent-soft")
              }
            >
              <WarningCircle
                size={22}
                weight="fill"
                className={isDanger ? "text-danger" : "text-accent"}
              />
            </div>
            <div>
              <h2 id="confirm-modal-title" className="text-base font-semibold text-ink">
                {title}
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg p-1 text-ink-faint hover:bg-bg-muted hover:text-ink disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={pending} className="admin-btn-secondary">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              isDanger
                ? "inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                : "admin-btn-primary disabled:opacity-50"
            }
          >
            {pending ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
