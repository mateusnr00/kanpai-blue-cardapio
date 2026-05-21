"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FAB() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: "sticky",
        bottom: 24,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        marginTop: -56,
      }}
    >
      <Link
        href="/"
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 22px",
          background: "var(--ink)",
          color: "#FAFAF8",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          boxShadow: "0 4px 16px rgba(26, 14, 110, 0.25)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 4H12" stroke="#FAFAF8" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M2 7H12" stroke="#FAFAF8" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M2 10H12" stroke="#FAFAF8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Cardápio
      </Link>
    </motion.div>
  );
}
