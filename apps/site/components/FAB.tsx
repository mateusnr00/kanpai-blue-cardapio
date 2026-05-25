"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fs } from "@/lib/scale";

type Props = {
  restaurantId?: string;
};

export function FAB({ restaurantId }: Props = {}) {
  const href = restaurantId ? `/${restaurantId}` : "/";
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        // Respeita a safe area de iPhones com home indicator.
        // No mobile, somamos 10px referente ao padding da moldura externa.
        paddingBottom: "max(28px, calc(env(safe-area-inset-bottom) + 14px))",
        paddingLeft: 16,
        paddingRight: 16,
        pointerEvents: "none",
      }}
    >
      <Link
        href={href}
        aria-label="Voltar para o cardápio"
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          // Touch target: ~50px de altura, confortável no mobile
          padding: "14px 26px",
          minHeight: 50,
          background: "var(--ink)",
          color: "#FAFAF8",
          borderRadius: 999,
          fontSize: fs(13),
          fontWeight: 500,
          letterSpacing: "-0.005em",
          // Borda sutil pra dar definição
          border: "0.5px solid rgba(255, 255, 255, 0.08)",
          // Sombra em camadas: ambient + key light
          boxShadow:
            "0 1px 2px rgba(26, 14, 110, 0.18), " +
            "0 6px 14px rgba(26, 14, 110, 0.22), " +
            "0 12px 28px rgba(26, 14, 110, 0.18)",
          // Anti-aliasing pra texto branco em fundo escuro
          WebkitFontSmoothing: "antialiased",
          // Transição suave no toque
          transition: "transform 120ms ease, box-shadow 200ms ease",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2.5 4.5H13.5" stroke="#FAFAF8" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M2.5 8H13.5" stroke="#FAFAF8" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M2.5 11.5H13.5" stroke="#FAFAF8" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Cardápio
      </Link>
    </motion.div>
  );
}
