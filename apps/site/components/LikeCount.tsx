"use client";

import { useLikes } from "./LikesProvider";
import { fs } from "@/lib/scale";

type Props = {
  dishId: string;
  /** Tamanho da fonte do numero (px). Heart escala proporcional. */
  fontSize?: number;
};

/**
 * Display da contagem de likes com coracao vermelho preenchido.
 * Renderiza NADA quando count == 0 — fica invisivel ate alguem curtir.
 */
export function LikeCount({ dishId, fontSize = 11 }: Props) {
  const { counts } = useLikes();
  const count = counts[dishId] ?? 0;
  if (count <= 0) return null;
  const heart = Math.round(fontSize * 1.05);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: fs(fontSize),
        fontWeight: 500,
        fontVariantNumeric: "tabular-nums",
        color: "var(--ink-soft)",
        lineHeight: 1,
      }}
      aria-label={`${count} ${count === 1 ? "curtida" : "curtidas"}`}
    >
      <span>{count}</span>
      <svg
        width={heart}
        height={heart}
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Z"
          fill="#FF5353"
        />
      </svg>
    </span>
  );
}
