"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  threshold?: number;
  rootMargin?: string;
};

/**
 * Dispara `onImpression` UMA vez quando o elemento entra no viewport
 * acima do threshold (default 0.5). Sem disparo duplicado.
 */
export function useImpressionOnce<T extends Element>(
  onImpression: () => void,
  { threshold = 0.5, rootMargin = "0px" }: Options = {}
): RefObject<T> {
  const ref = useRef<T>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (firedRef.current) return;

    if (typeof IntersectionObserver === "undefined") {
      // SSR ou browser muito antigo: dispara mesmo assim, sem precisão.
      firedRef.current = true;
      onImpression();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            if (!firedRef.current) {
              firedRef.current = true;
              onImpression();
            }
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: [threshold], rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onImpression, threshold, rootMargin]);

  return ref;
}
