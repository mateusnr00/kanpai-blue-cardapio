"use client";

import { motion } from "framer-motion";
import { useLikes } from "./LikesProvider";

type Props = {
  dishId: string;
  /** Tamanho do icone (px). Default 28. */
  size?: number;
};

/**
 * Coracao clicavel — outline cinza quando nao curtido, preenchido
 * vermelho quando curtido. Sem pill, sem contagem (use <LikeCount/>
 * separado pra mostrar o numero).
 *
 * Inspirado no Uiverse (KSAplay) — scale anim like/dislike, hover 1.1.
 */
export function LikeButton({ dishId, size = 28 }: Props) {
  const { liked, toggle } = useLikes();
  const isLiked = !!liked[dishId];

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    void toggle(dishId);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? "Descurtir" : "Curtir"}
      aria-pressed={isLiked}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: "transparent",
        border: "none",
        padding: 4,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <motion.svg
        key={isLiked ? "on" : "off"}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M12 21s-7.5-4.6-9.7-9.2C.7 8.4 2.2 4.5 5.6 4.1c2.2-.3 4.2 1 5.1 2.8.4.8 1.2 1.3 2.1 1.3.9 0 1.7-.5 2.1-1.3.9-1.8 2.9-3.1 5.1-2.8 3.4.4 4.9 4.3 3.3 7.7C19.5 16.4 12 21 12 21z"
          fill={isLiked ? "#FF5353" : "none"}
          stroke={isLiked ? "none" : "var(--ink-soft)"}
          strokeWidth={isLiked ? 0 : 1.6}
          style={{ transition: "fill 180ms ease, stroke 180ms ease" }}
        />
      </motion.svg>
    </motion.button>
  );
}
