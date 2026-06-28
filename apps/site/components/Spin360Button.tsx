"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Dish } from "@/lib/menu-data";
import { fs } from "@/lib/scale";
import { track } from "@/lib/analytics";
import { get360Config, spin360FrameUrls } from "@/lib/spin360";

const Spin360 = dynamic(() => import("./Spin360").then((m) => m.Spin360), {
  ssr: false,
});

type Props = {
  dish: Dish;
  restaurantId: string;
};

/**
 * Botão "Ver em 360°" — renderiza só pra pratos registrados em lib/spin360.
 * Para qualquer outro prato, retorna null (não aparece nada).
 */
export function Spin360Button({ dish, restaurantId }: Props) {
  const cfg = useMemo(() => get360Config(restaurantId, dish), [restaurantId, dish]);
  const [open, setOpen] = useState(false);

  if (!cfg) return null;
  const frameUrls = spin360FrameUrls(cfg);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          track({ event_type: "dish_view", dish_slug: dish.id, restaurant_id: restaurantId });
        }}
        aria-label={`Ver ${dish.name} em 360 graus`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          background: "var(--ink)",
          border: "0.5px solid var(--ink)",
          borderRadius: 999,
          cursor: "pointer",
          color: "#FAFAF8",
          fontSize: fs(11),
          fontWeight: 500,
          letterSpacing: "-0.005em",
          whiteSpace: "nowrap",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18 3v3.5h-3.5M6 21v-3.5h3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        360°
      </button>

      <AnimatePresence>
        {open ? (
          <Spin360 frameUrls={frameUrls} alt={dish.name} onClose={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
