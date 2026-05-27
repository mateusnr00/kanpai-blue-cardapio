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
const callbackMap = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(options: { threshold: number; rootMargin: string }): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbackMap.get(entry.target);
        if (!cb) continue;
        callbackMap.delete(entry.target);
        cb();
        sharedObserver?.unobserve(entry.target);
      }
    },
    { threshold: [options.threshold], rootMargin: options.rootMargin },
  );
  return sharedObserver;
}

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

    const observer = getObserver({ threshold, rootMargin });
    if (!observer) {
      // SSR ou browser muito antigo: dispara mesmo assim, sem precisão.
      firedRef.current = true;
      onImpression();
      return;
    }

    const wrapped = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      onImpression();
    };

    callbackMap.set(el, wrapped);
    observer.observe(el);
    return () => {
      callbackMap.delete(el);
      observer.unobserve(el);
    };
  }, [onImpression, threshold, rootMargin]);

  return ref;
}
