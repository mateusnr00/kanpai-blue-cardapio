"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type Aspect = "1/1" | "3/1" | "16/9" | "16/10";

type Props = {
  images: string[];
  alt: string;
  aspect?: Aspect;
  /** Tempo de exibição de cada slide (em segundos). Default 4s. */
  perSlide?: number;
  /** Conteúdo absoluto sobre a foto (ex.: badge, número). */
  topRight?: ReactNode;
  topLeftNumber?: string;
  dark?: boolean;
  /** Marca o primeiro slide como priority (LCP / above-the-fold). */
  priority?: boolean;
};

/**
 * Cross-fade slideshow 100% CSS. Sem JS de timer, sem reflow:
 * cada slide tem sua animation com delay escalonado, GPU-acelerada
 * via opacity. Roda smooth em qualquer mobile.
 *
 * Os keyframes sao computados dinamicamente em funcao de N pra que
 * cada slide ocupe exatamente 1/N do ciclo com leve overlap.
 */
export function CategorySlideshow({
  images,
  alt,
  aspect = "1/1",
  perSlide = 4,
  topRight,
  topLeftNumber: _topLeftNumber,
  dark: _dark,
  priority,
}: Props) {
  const n = images.length;
  if (n === 0) return null;

  const total = n * perSlide;
  const slotPct = 100 / n;
  const fadeIn = (slotPct * 0.07).toFixed(3);
  const holdEnd = (slotPct * 0.93).toFixed(3);
  const fadeOut = (slotPct * 1.07).toFixed(3);
  const animName = `cat-slideshow-${n}`;

  // Quando só tem 1 imagem, sem animation
  const isStatic = n === 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: aspect,
        overflow: "hidden",
        background: "var(--ink-ghost)",
      }}
      aria-label={alt}
      role="img"
    >
      {!isStatic ? (
        <style>{`
          @keyframes ${animName} {
            0% { opacity: 0; }
            ${fadeIn}% { opacity: 1; }
            ${holdEnd}% { opacity: 1; }
            ${fadeOut}% { opacity: 0; }
            100% { opacity: 0; }
          }
        `}</style>
      ) : null}

      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          priority={priority && i === 0}
          loading={priority && i === 0 ? "eager" : "lazy"}
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "cover",
            opacity: isStatic ? 1 : 0,
            animation: isStatic
              ? undefined
              : `${animName} ${total}s linear infinite`,
            animationDelay: isStatic ? undefined : `${i * perSlide}s`,
            animationFillMode: isStatic ? undefined : "backwards",
            willChange: "opacity",
          }}
        />
      ))}

      {topRight ? (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>
          {topRight}
        </div>
      ) : null}
    </div>
  );
}
