"use client";

import { motion } from "framer-motion";
import { useLikes } from "./LikesProvider";
import { fs } from "@/lib/scale";

type Props = {
  dishId: string;
  /** Variante de tamanho. `small` é o default pros cards 2x2. */
  size?: "small" | "large";
};

export function LikeButton({ dishId, size = "small" }: Props) {
  const { counts, liked, toggle } = useLikes();
  const count = counts[dishId] ?? 0;
  const isLiked = !!liked[dishId];

  const isLarge = size === "large";
  const height = isLarge ? 36 : 28;
  const padding = isLarge ? "0 4px 0 12px" : "0 4px 0 10px";
  const iconSize = isLarge ? 18 : 14;
  const textSize = isLarge ? 13 : 11;
  const minW = isLarge ? 88 : 66;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void toggle(dishId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? `Descurtir, ${count} curtidas` : `Curtir, ${count} curtidas`}
      aria-pressed={isLiked}
      style={{
        height,
        minWidth: minW,
        padding,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        background: "var(--ink)",
        color: "#FAFAF8",
        borderRadius: 999,
        border: "0.5px solid rgba(255, 255, 255, 0.08)",
        cursor: "pointer",
        boxShadow:
          "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 2px 6px rgba(26, 14, 110, 0.18)",
        transition: "transform 120ms ease, box-shadow 200ms ease",
      }}
    >
      <motion.span
        key={isLiked ? "on" : "off"}
        initial={isLiked ? { scale: 0.6 } : false}
        animate={isLiked ? { scale: [0.6, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: iconSize + 2,
          height: iconSize + 2,
        }}
        aria-hidden
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={isLiked ? "#FC4E4E" : "rgba(255, 255, 255, 0.35)"}
          xmlns="http://www.w3.org/2000/svg"
          style={{ transition: "fill 180ms ease" }}
        >
          <path d="M12 21s-7.5-4.6-9.7-9.2C.7 8.4 2.2 4.5 5.6 4.1c2.2-.3 4.2 1 5.1 2.8.4.8 1.2 1.3 2.1 1.3.9 0 1.7-.5 2.1-1.3.9-1.8 2.9-3.1 5.1-2.8 3.4.4 4.9 4.3 3.3 7.7C19.5 16.4 12 21 12 21z" />
        </svg>
      </motion.span>
      <span
        style={{
          fontSize: fs(textSize),
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          paddingRight: isLarge ? 8 : 6,
          paddingLeft: 4,
          color: isLiked ? "#FAFAF8" : "rgba(250, 250, 248, 0.55)",
          transition: "color 180ms ease",
          minWidth: textSize * 1.5,
          textAlign: "right",
        }}
      >
        {count}
      </span>
    </button>
  );
}
