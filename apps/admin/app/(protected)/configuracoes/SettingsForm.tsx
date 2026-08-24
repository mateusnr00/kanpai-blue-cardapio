"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettings } from "./actions";
import type { SiteSettings } from "@/lib/data/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [metaPixelId, setMetaPixelId] = useState(initial.metaPixelId);
  const [ga4Id, setGa4Id] = useState(initial.ga4Id);
  const [googleAdsId, setGoogleAdsId] = useState(initial.googleAdsId);
  const [tiktokPixelId, setTiktokPixelId] = useState(initial.tiktokPixelId);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await saveSettings({ metaPixelId, ga4Id, googleAdsId, tiktokPixelId });
      if (res.error) toast.error(res.error);
      else toast.success("Configurações salvas");
    });
  }

  return (
    <div className="admin-card p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
        Pixels &amp; Analytics
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        Disparam em todo o site público (cardápio das duas unidades, linktree e avaliação).
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meta" className="admin-label">Meta (Facebook) Pixel ID</label>
          <input
            id="meta"
            type="text"
            inputMode="numeric"
            value={metaPixelId}
            onChange={(e) => setMetaPixelId(e.target.value)}
            placeholder="Ex: 458944128890645"
            className="admin-input font-mono"
          />
          <p className="text-[11px] text-ink-soft">
            Encontre em Gerenciador de Eventos → Fontes de dados → seu pixel.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ga4" className="admin-label">Google Analytics 4 (GA4) Measurement ID</label>
          <input
            id="ga4"
            type="text"
            value={ga4Id}
            onChange={(e) => setGa4Id(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="admin-input font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ads" className="admin-label">Google Ads ID (opcional)</label>
          <input
            id="ads"
            type="text"
            value={googleAdsId}
            onChange={(e) => setGoogleAdsId(e.target.value)}
            placeholder="AW-XXXXXXXXX"
            className="admin-input font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tiktok" className="admin-label">TikTok Pixel ID (opcional)</label>
          <input
            id="tiktok"
            type="text"
            value={tiktokPixelId}
            onChange={(e) => setTiktokPixelId(e.target.value)}
            placeholder="CXXXXXXX"
            className="admin-input font-mono"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="admin-btn-primary"
          >
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
