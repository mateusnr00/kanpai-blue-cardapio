"use client";

import { DotsSixVertical } from "@phosphor-icons/react";

type Props = {
  className?: string;
};

export function DragHandle({ className }: Props) {
  return (
    <div className={`admin-drag-handle ${className ?? ""}`} aria-hidden>
      <DotsSixVertical size={18} weight="bold" />
    </div>
  );
}
