"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const KANPAI_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/KANPAI.png";
const BLUE_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/BLUE.png";

// Duração total da intro antes de chamar onDone (em ms).
// Compõe-se de:
//   - 150ms delay inicial
//   - 900ms de travel das peças (slide-in)
//   - ~750ms hold (logo formado, "kanpai blue")
//   - 300ms já adiantando o exit
const TOTAL_MS = 2100;

type Props = { onDone: () => void };

export function IntroAnimation({ onDone }: Props) {
  // Auto-dismiss depois do tempo definido
  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
      }}
      role="presentation"
      aria-hidden
      onClick={onDone}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--bg-warm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "min(3.5vw, 28px)",
          paddingLeft: 24,
          paddingRight: 24,
          maxWidth: "100%",
        }}
      >
        {/* kanpai vem da esquerda */}
        <motion.div
          initial={{ x: "-110vw", opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.95,
              ease: [0.32, 0.72, 0, 1],
              delay: 0.15,
              opacity: { duration: 0.4, delay: 0.15 },
            },
          }}
          style={{ display: "flex", flexShrink: 0 }}
        >
          <Image
            src={KANPAI_URL}
            alt=""
            width={1080}
            height={400}
            priority
            sizes="(max-width: 767px) 56vw, 480px"
            style={{
              height: "clamp(64px, 15vw, 140px)",
              width: "auto",
              display: "block",
            }}
          />
        </motion.div>

        {/* blue vem da direita */}
        <motion.div
          initial={{ x: "110vw", opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.95,
              ease: [0.32, 0.72, 0, 1],
              delay: 0.15,
              opacity: { duration: 0.4, delay: 0.15 },
            },
          }}
          style={{ display: "flex", flexShrink: 0 }}
        >
          <Image
            src={BLUE_URL}
            alt=""
            width={500}
            height={500}
            priority
            sizes="(max-width: 767px) 24vw, 180px"
            style={{
              height: "clamp(64px, 15vw, 140px)",
              width: "auto",
              display: "block",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
