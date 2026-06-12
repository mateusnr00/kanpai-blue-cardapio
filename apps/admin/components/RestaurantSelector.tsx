"use client";

import { useTransition } from "react";
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
  const router = useRouter();

  function onChange(next: string) {
    if (next === active) return;
    startTransition(async () => {
      const res = await setActiveRestaurant(next);
      if ("error" in res) {
        toast.error("Falha ao trocar unidade.");
        return;
      }
      const unit = restaurants.find((r) => r.id === next)?.short_name ?? "unidade";
      toast.success(`Unidade: ${unit}`);
      // Recarrega a rota atual JÁ com o cookie novo (a action acima só altera o
      // cookie no response — sem este refresh a tela ficaria no estado antigo
      // até um F5).
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
    </div>
  );
}
