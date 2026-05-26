"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  src: string;
  alt: string;
  /** Texto opcional mostrado abaixo da foto (descricao curta do prato). */
  description?: string;
  onClose: () => void;
};

/**
 * Lightbox fullscreen pra visualizar foto de prato em alta definicao.
 * - Click no backdrop ou no botao X fecha.
 * - ESC fecha.
 * - Body scroll travado enquanto aberto.
 * - Next/Image com sizes=100vw e quality=95 pega a maior resolucao.
 * - Nome do prato aparece abaixo da foto (alt como titulo).
 */
export function ImageLightbox({ src, alt, description, onClose }: Props) {
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
        zIndex: 200,
        background: "rgba(8, 4, 30, 0.98)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        cursor: "zoom-out",
      }}
    >
      {/* Top bar com botão fechar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "calc(env(safe-area-inset-top) + 14px) 18px 8px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Fechar"
          style={{
            width: 38,
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.10)",
            color: "#FAFAF8",
            border: "0.5px solid rgba(255, 255, 255, 0.18)",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Imagem central */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            maxWidth: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.55), 0 0 0 0.5px rgba(255, 255, 255, 0.05) inset",
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 1100px"
              quality={95}
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Bottom info card */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.32, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          padding:
            "16px 24px calc(env(safe-area-inset-bottom) + 24px)",
          textAlign: "center",
          color: "#FAFAF8",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
          }}
        >
          {alt}
        </p>
        {description ? (
          <p
            style={{
              margin: "6px auto 0",
              maxWidth: 560,
              fontSize: 13,
              fontWeight: 400,
              color: "rgba(250, 250, 248, 0.72)",
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
