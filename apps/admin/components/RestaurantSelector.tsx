"use client";

import { useTransition } from "react";
import { Storefront } from "@phosphor-icons/react";
import { toast } from "sonner";
import { setActiveRestaurant } from "@/app/actions/restaurant";
import type { RestaurantRow } from "@/lib/active-restaurant";

type Props = {
  active: string;
  restaurants: RestaurantRow[];
};

export function RestaurantSelector({ active, restaurants }: Props) {
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === active) return;
    startTransition(async () => {
      const res = await setActiveRestaurant(next);
      if ("error" in res) {
        toast.error("Falha ao trocar unidade.");
      } else {
        toast.success("Unidade alterada.");
      }
    });
  }

  return (
    <label className="relative inline-flex items-center gap-2 rounded-full border border-ink-faint bg-bg-card px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
      <Storefront size={14} weight="duotone" />
      <select
        value={active}
        onChange={onChange}
        disabled={pending}
        className="appearance-none bg-transparent pr-3 text-xs font-medium text-ink outline-none disabled:opacity-50"
      >
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>{r.short_name}</option>
        ))}
      </select>
    </label>
  );
}
