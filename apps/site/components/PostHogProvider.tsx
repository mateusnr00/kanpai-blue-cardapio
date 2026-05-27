"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const CONSENT_KEY = "kanpai-lgpd-consent";

function bannerRequired(): boolean {
  return process.env.NEXT_PUBLIC_LGPD_BANNER === "1";
}

function readConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Inicializa PostHog uma vez. Configuração conservadora pra LGPD:
 *   - Sem session recording
 *   - Texto mascarado (mask_all_text)
 *   - Respeita Do-Not-Track do navegador
 *
 * Se NEXT_PUBLIC_LGPD_BANNER=1, começa com opt-out e só captura após Aceitar
 * (ver ConsentBanner). Sem essa flag, PostHog captura imediatamente.
 *
 * Se NEXT_PUBLIC_POSTHOG_KEY não está setada, é no-op.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initedRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (initedRef.current) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    const needsConsent = bannerRequired();
    const consent = readConsent();
    const optedOutByDefault = needsConsent && consent !== "accepted";

    posthog.init(key, {
      api_host: host,
      capture_pageview: false, // disparamos manualmente abaixo (Next.js client-side nav)
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      respect_dnt: true,
      opt_out_capturing_by_default: optedOutByDefault,
      persistence: "localStorage+cookie",
    });
    initedRef.current = true;
  }, []);

  // Page view manual a cada mudança de rota client-side.
  useEffect(() => {
    if (!initedRef.current) return;
    if (typeof window === "undefined") return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    posthog.capture("$pageview", { $current_url: window.location.origin + url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export function recordLgpdConsent(value: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // localStorage indisponível — segue sem persistir
  }
  if (value === "accepted") {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

export function isLgpdBannerEnabled(): boolean {
  return bannerRequired();
}

export function hasLgpdConsent(): boolean {
  return readConsent() !== null;
}
