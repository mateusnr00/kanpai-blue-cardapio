"use client";

import { useEffect, useState } from "react";

/**
 * true quando a viewport é desktop (>= 768px). Default true (SSR/primeiro
 * render) pra casar com o uso majoritário do admin no desktop; ajusta após
 * montar no client.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}
