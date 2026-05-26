"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

/**
 * Lightbox fullscreen pra visualizar foto de prato em alta definicao.
 * - Click no backdrop ou no botao X fecha.
 * - ESC fecha.
 * - Body scroll travado enquanto aberto.
 * - Next/Image com sizes=100vw pega a maior resolucao disponivel.
 */
export function ImageLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ampliada: ${alt}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0, 0, 0, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(env(safe-area-inset-top) + 24px) 16px calc(env(safe-area-inset-bottom) + 24px)",
        cursor: "zoom-out",
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1200,
          maxHeight: "100%",
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={95}
          priority
          style={{ objectFit: "contain" }}
        />
      </motion.div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 16px)",
          right: 16,
          width: 40,
          height: 40,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          background: "rgba(255, 255, 255, 0.12)",
          color: "#FAFAF8",
          border: "0.5px solid rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}
