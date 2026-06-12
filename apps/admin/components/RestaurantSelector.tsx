"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Storefront } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AdminSelect } from "./AdminSelect";
import { setActiveRestaurant } from "@/app/actions/restaurant";
import type { RestaurantRow } from "@/lib/restaurants-shared";

type Props = {
  active: string;
  restaurants: RestaurantRow[];
  fullWidth?: boolean;
};

export function RestaurantSelector({ active, restaurants, fullWidth }: Props) {
  const [pending, startTransition] = useTransition();
  const [splash, setSplash] = useState<string | null>(null);
  const router = useRouter();

  // Splash some sozinho. onClick (abaixo) deixa pular antes.
  useEffect(() => {
    if (!splash) return;
    const t = setTimeout(() => setSplash(null), 1400);
    return () => clearTimeout(t);
  }, [splash]);

  function onChange(next: string) {
    if (next === active) return;
    startTransition(async () => {
      const res = await setActiveRestaurant(next);
      if ("error" in res) {
        toast.error("Falha ao trocar unidade.");
        return;
      }
      const unit = restaurants.find((r) => r.id === next)?.short_name ?? "unidade";
      // Intro/splash deixa óbvio que a unidade mudou.
      setSplash(unit);
      // Recarrega a rota atual JÁ com o cookie novo (a action acima só altera o
      // cookie no response — sem este refresh a tela ficaria no estado antigo
      // até um F5). Acontece "atrás" do splash.
      router.refresh();
    });
  }

  return (
    <div className={fullWidth ? "w-full" : undefined}>
      <div className="mb-1.5 flex items-center gap-2">
        <Storefront size={16} weight="duotone" className="text-accent" />
        <span className="admin-label">Unidade</span>
      </div>
      <AdminSelect
        id="admin-restaurant"
        value={active}
        onChange={onChange}
        disabled={pending}
        options={restaurants.map((r) => ({ value: r.id, label: r.short_name }))}
        className={fullWidth ? "w-full" : undefined}
      />

      {splash ? (
        <div
          className="unit-splash"
          role="status"
          aria-live="polite"
          onClick={() => setSplash(null)}
        >
          <div className="unit-splash__inner">
            <Storefront size={44} weight="duotone" />
            <span className="unit-splash__eyebrow">Unidade ativa</span>
            <span className="unit-splash__name">{splash}</span>
          </div>
          <style>{`
            .unit-splash {
              position: fixed; inset: 0; z-index: 200;
              display: flex; align-items: center; justify-content: center;
              background: linear-gradient(135deg, #1a0e6e 0%, #2d4ae8 100%);
              cursor: pointer;
              animation: unitSplashFade 1400ms ease forwards;
            }
            .unit-splash__inner {
              display: flex; flex-direction: column; align-items: center; gap: 10px;
              color: #fff; text-align: center; padding: 24px;
              animation: unitSplashPop 1400ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
            }
            .unit-splash__eyebrow {
              font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; opacity: 0.7;
            }
            .unit-splash__name {
              font-size: 28px; font-weight: 600; letter-spacing: -0.01em;
            }
            @keyframes unitSplashFade {
              0% { opacity: 0; } 12% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; }
            }
            @keyframes unitSplashPop {
              0% { opacity: 0; transform: translateY(10px) scale(0.96); }
              18% { opacity: 1; transform: translateY(0) scale(1); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @media (prefers-reduced-motion: reduce) {
              .unit-splash { animation: unitSplashFade 1400ms steps(1, end) forwards; }
              .unit-splash__inner { animation: none; }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}
