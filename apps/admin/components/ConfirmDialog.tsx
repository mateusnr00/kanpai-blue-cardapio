"use client";

import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { ConfirmModal } from "./ConfirmModal";

type Props = {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  pending: externalPending,
}: Props) {
  const [open, setOpen] = useState(false);
  const [internalPending, setInternalPending] = useState(false);
  const pending = externalPending ?? internalPending;

  async function handleConfirm() {
    setInternalPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setInternalPending(false);
    }
  }

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
        onClick: (e: React.MouseEvent) => {
          (trigger as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props.onClick?.(e);
          if (!e.defaultPrevented) setOpen(true);
        },
      })
    : trigger;

  return (
    <>
      {triggerEl}
      <ConfirmModal
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={variant}
        pending={pending}
        onCancel={() => {
          if (!pending) setOpen(false);
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
}
