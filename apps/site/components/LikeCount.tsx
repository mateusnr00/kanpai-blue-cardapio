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
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M12 21s-7.5-4.6-9.7-9.2C.7 8.4 2.2 4.5 5.6 4.1c2.2-.3 4.2 1 5.1 2.8.4.8 1.2 1.3 2.1 1.3.9 0 1.7-.5 2.1-1.3.9-1.8 2.9-3.1 5.1-2.8 3.4.4 4.9 4.3 3.3 7.7C19.5 16.4 12 21 12 21z"
          fill="#FF5353"
        />
      </svg>
    </span>
  );
}
