"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fs } from "@/lib/scale";

type Props = {
  frameUrls: string[];
  alt: string;
  onClose: () => void;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Pixels de arraste por frame (menor = gira mais rápido). */
const PX_PER_FRAME = 4;

/**
 * Visualizador 360° em tela cheia. Pré-carrega todos os frames (com barra de
 * progresso) e gira ao arrastar o dedo/mouse. Frames que falharem são ignorados.
 */
export function Spin360({ frameUrls, alt, onClose }: Props) {
  const [settled, setSettled] = useState(0);
  const [validUrls, setValidUrls] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  const drag = useRef<{ active: boolean; startX: number; startIndex: number }>({
    active: false,
    startX: 0,
    startIndex: 0,
  });

  // Trava o scroll do body enquanto aberto.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape fecha.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Pré-carrega todos os frames; conta os que carregaram de fato.
  useEffect(() => {
    let cancelled = false;
    const ok: boolean[] = new Array(frameUrls.length).fill(false);
    let done = 0;

    const onSettle = () => {
      if (cancelled) return;
      done += 1;
      setSettled(done);
      if (done === frameUrls.length) {
        const valid = frameUrls.filter((_, i) => ok[i]);
        setValidUrls(valid);
        setReady(true);
      }
    };

    const imgs = frameUrls.map((url, i) => {
      const img = new window.Image();
      img.onload = () => {
        ok[i] = true;
        onSettle();
      };
      img.onerror = () => onSettle();
      img.src = url;
      return img;
    });

    return () => {
      cancelled = true;
      imgs.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [frameUrls]);

  const total = validUrls.length;

  function onPointerDown(e: React.PointerEvent) {
    if (!ready || total === 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { active: true, startX: e.clientX, startIndex: index };
    setHintVisible(false);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active || total === 0) return;
    const dx = e.clientX - drag.current.startX;
    const steps = Math.round(dx / PX_PER_FRAME);
    setIndex(mod(drag.current.startIndex - steps, total));
  }

  function endDrag(e: React.PointerEvent) {
    drag.current.active = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  const progress = frameUrls.length > 0 ? Math.round((settled / frameUrls.length) * 100) : 0;
  const currentSrc = total > 0 ? validUrls[mod(index, total)] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização 360° de ${alt}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(10, 6, 40, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Botão fechar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        style={{
          position: "absolute",
          top: "max(16px, env(safe-area-inset-top))",
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          cursor: "pointer",
          border: "0.5px solid rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.08)",
          zIndex: 2,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Palco do 360 */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          width: "min(92vw, 720px)",
          aspectRatio: "1 / 1",
          position: "relative",
          touchAction: "none",
          cursor: ready && total > 0 ? "grab" : "default",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ready && currentSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentSrc}
            alt={alt}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        ) : (
          // Estado de carregamento
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div
              style={{
                width: 180,
                height: 4,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                overflow: "hidden",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#fff",
                  transition: "width 120ms linear",
                }}
              />
            </div>
            <p style={{ marginTop: 14, fontSize: fs(12), opacity: 0.8 }}>
              Carregando 360°… {progress}%
            </p>
          </div>
        )}

        {ready && total === 0 ? (
          <p style={{ color: "#fff", fontSize: fs(13), opacity: 0.85, textAlign: "center", padding: 24 }}>
            Não foi possível carregar as imagens 360°.
          </p>
        ) : null}
      </div>

      {/* Dica de interação */}
      {ready && total > 0 && hintVisible ? (
        <div
          style={{
            position: "absolute",
            bottom: "max(28px, env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            border: "0.5px solid rgba(255,255,255,0.25)",
            color: "#fff",
            fontSize: fs(11),
            letterSpacing: "0.02em",
            pointerEvents: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path d="M18 3v3.5h-3.5M6 21v-3.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Arraste para girar
        </div>
      ) : null}
    </motion.div>
  );
}
