"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  imageUrl: string;
  /** Chave do storage pra evitar mostrar de novo na mesma sessão. */
  storageKey: string;
};

/**
 * Modal de aviso/anuncio que aparece UMA VEZ por sessao (sessionStorage).
 * Toggle + imagem sao geridos no admin (/aviso). Pra remover do projeto
 * de vez:
 *   1. Drop nas colunas restaurants.announcement_active e
 *      restaurants.announcement_image_path.
 *   2. Apaga este componente, /admin/app/(protected)/aviso/, o item do
 *      AdminSidebar NAV, e o uso em apps/site/app/[restaurant]/page.tsx.
 */
export function AnnouncementModal({ imageUrl, storageKey }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch {
      // sessionStorage indisponível: mostra mesmo assim
    }
    const t = window.setTimeout(() => setOpen(true), 200);
    return () => window.clearTimeout(t);
  }, [storageKey]);

  function dismiss() {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {}
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Aviso"
          onClick={dismiss}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 220,
            background: "rgba(8, 4, 30, 0.86)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "calc(env(safe-area-inset-top) + 32px) 18px calc(env(safe-area-inset-bottom) + 32px)",
            cursor: "pointer",
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.55)",
              background: "#000",
              cursor: "default",
            }}
          >
            <Image
              src={imageUrl}
              alt="Aviso"
              width={960}
              height={1440}
              sizes="(max-width: 768px) 92vw, 480px"
              priority
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fechar aviso"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "rgba(0, 0, 0, 0.55)",
                color: "#FAFAF8",
                border: "0.5px solid rgba(255, 255, 255, 0.25)",
                cursor: "pointer",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
