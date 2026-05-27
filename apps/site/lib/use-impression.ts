"use client";

import { useEffect, useRef, type RefObject } from "react";

type Options = {
  threshold?: number;
  rootMargin?: string;
  /**
   * Tempo em ms que o elemento precisa ficar visível antes de disparar.
   * Evita contar pratos quando o cliente desce a lista rolando rápido.
   * Default 2000ms (2s).
   */
  dwellMs?: number;
};

type Pending = {
  callback: () => void;
  timerId: number | null;
  dwellMs: number;
};

const pendingMap = new WeakMap<Element, Pending>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(options: { threshold: number; rootMargin: string }): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const p = pendingMap.get(entry.target);
        if (!p) continue;

        if (entry.isIntersecting) {
          // Já tem timer pendente — não reinicia.
          if (p.timerId != null) continue;
          if (p.dwellMs <= 0) {
            // Sem dwell: dispara imediato (compat com call sites antigos).
            pendingMap.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
            p.callback();
            continue;
          }
          p.timerId = window.setTimeout(() => {
            // Quando o timer estoura, garante que ainda está pendente (não saiu antes).
            const still = pendingMap.get(entry.target);
            if (!still || still.timerId == null) return;
            pendingMap.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
            still.callback();
          }, p.dwellMs);
        } else {
          // Saiu do viewport antes de bater o dwell — cancela.
          if (p.timerId != null) {
            window.clearTimeout(p.timerId);
            p.timerId = null;
          }
        }
      }
    },
    { threshold: [options.threshold], rootMargin: options.rootMargin },
  );
  return sharedObserver;
}

/**
 * Dispara `onImpression` UMA vez quando o elemento fica visível
 * acima do threshold (default 0.5) por pelo menos `dwellMs` (default 2000ms).
 * Sem disparo duplicado. Se sair do viewport antes do dwell, cancela.
 */
export function useImpressionOnce<T extends Element>(
  onImpression: () => void,
  { threshold = 0.5, rootMargin = "0px", dwellMs = 2000 }: Options = {}
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

    pendingMap.set(el, { callback: wrapped, timerId: null, dwellMs });
    observer.observe(el);
    return () => {
      const p = pendingMap.get(el);
      if (p?.timerId != null) window.clearTimeout(p.timerId);
      pendingMap.delete(el);
      observer.unobserve(el);
    };
  }, [onImpression, threshold, rootMargin, dwellMs]);

  return ref;
}
