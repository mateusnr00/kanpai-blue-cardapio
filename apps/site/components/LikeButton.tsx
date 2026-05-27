"use client";

import { motion } from "framer-motion";
import { useLikes } from "./LikesProvider";
import { useLikesEnabled } from "./LikesEnabledProvider";

type Props = {
  dishId: string;
  /** Tamanho do icone (px). Default 32. */
  size?: number;
};

/**
 * Coracao clicavel — outline cinza quando nao curtido, preenchido
 * vermelho quando curtido. Sem pill, sem contagem (use <LikeCount/>
 * separado pra mostrar o numero).
 *
 * Visual do Uiverse (KSAplay): heart Phosphor com stroke arredondado,
 * scale anim like/dislike 400ms, hover 1.1.
 */
export function LikeButton({ dishId, size = 32 }: Props) {
  const enabled = useLikesEnabled();
  const { liked, toggle } = useLikes();
  const isLiked = !!liked[dishId];
  if (!enabled) return null;

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
        padding: 2,
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
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Z"
          fill={isLiked ? "#FF5353" : "none"}
          stroke={isLiked ? "none" : "var(--ink-soft)"}
          strokeWidth={isLiked ? 0 : 14}
          strokeLinejoin="round"
          style={{ transition: "fill 180ms ease, stroke 180ms ease" }}
        />
      </motion.svg>
    </motion.button>
  );
}
