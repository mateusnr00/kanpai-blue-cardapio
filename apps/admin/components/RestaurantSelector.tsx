"use client";

import { useTransition } from "react";
import { Storefront } from "@phosphor-icons/react";
import { toast } from "sonner";
import { setActiveRestaurant } from "@/app/actions/restaurant";
import type { RestaurantRow } from "@/lib/active-restaurant";

type Props = {
  active: string;
  restaurants: RestaurantRow[];
  fullWidth?: boolean;
};

export function RestaurantSelector({ active, restaurants, fullWidth }: Props) {
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
    <label
      className={
        "relative flex items-center gap-2 rounded-lg border border-ink-ghost bg-bg-surface px-3 py-2.5 text-sm font-medium text-ink shadow-sm " +
        (fullWidth ? "w-full" : "inline-flex")
      }
    >
      <Storefront size={16} weight="duotone" className="shrink-0 text-accent" />
      <span className="shrink-0 text-xs text-ink-muted">Unidade</span>
      <select
        value={active}
        onChange={onChange}
        disabled={pending}
        className={
          "min-w-0 flex-1 appearance-none bg-transparent text-sm font-medium text-ink outline-none disabled:opacity-50 " +
          (fullWidth ? "" : "pr-3")
        }
      >
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>{r.short_name}</option>
        ))}
      </select>
    </label>
  );
}
