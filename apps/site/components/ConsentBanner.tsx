"use client";

import { useEffect, useState } from "react";
import {
  hasLgpdConsent,
  isLgpdBannerEnabled,
  recordLgpdConsent,
} from "./PostHogProvider";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLgpdBannerEnabled()) return;
    if (hasLgpdConsent()) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  function choose(value: "accepted" | "rejected") {
    recordLgpdConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de privacidade"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-2xl bg-zinc-900/95 px-5 py-4 text-sm text-white shadow-2xl backdrop-blur"
    >
      <p className="mb-3 leading-relaxed">
        Usamos cookies e ferramentas de análise para entender como o cardápio é
        usado e melhorar a experiência. Nada de dado pessoal sensível é coletado.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
        >
          Aceitar
        </button>
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Recusar
        </button>
      </div>
    </div>
  );
}
