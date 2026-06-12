"use client";

import { useState } from "react";
import { UNIT_LOGOS } from "@/lib/brand";

type Props = {
  restaurantId: string;
  name: string;
  /** Tamanho do quadrado da logo em px (default 80). */
  size?: number;
};

/**
 * Logo da unidade ativa — indicador visual claro de em qual unidade você está.
 * Fica oculto se a unidade não tiver logo cadastrada (ou se falhar ao carregar),
 * então nunca mostra imagem quebrada.
 */
export function ActiveUnitLogo({ restaurantId, name, size = 80 }: Props) {
  const [error, setError] = useState(false);
  const src = UNIT_LOGOS[restaurantId];
  if (!src || error) return null;
  return (
    <div className="flex items-center justify-center rounded-xl bg-bg-surface px-3 py-3 ring-1 ring-ink-ghost/70">
      {/* logo da unidade já contém o nome; <img> simples evita quebra antes do upload */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Logo ${name}`}
        onError={() => setError(true)}
        style={{ height: size, width: size }}
        className="object-contain"
      />
    </div>
  );
}
