"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  List,
  SignOut,
  X,
} from "@phosphor-icons/react";
import { RestaurantSelector } from "./RestaurantSelector";
import type { RestaurantRow } from "@/lib/active-restaurant";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type Props = {
  email: string | null;
  activeRestaurant: string;
  restaurants: RestaurantRow[];
};

export function MobileTopBar({ email, activeRestaurant, restaurants }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-ghost/80 bg-bg-surface/95 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Kanpai Admin">
          <Image src={LOGO_URL} alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-semibold text-ink">Kanpai Admin</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink-ghost bg-bg-surface px-4 py-3">
          <div className="flex flex-col gap-3">
            <RestaurantSelector active={activeRestaurant} restaurants={restaurants} />
            <a
              href="https://kanpai-blue.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-bg-muted"
            >
              <ArrowSquareOut size={18} weight="duotone" />
              Ver site público
            </a>
            <div className="flex items-center justify-between gap-3 border-t border-ink-ghost pt-3">
              {email ? <span className="truncate text-xs text-ink-faint">{email}</span> : <span />}
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="admin-btn-secondary text-xs">
                  <SignOut size={16} />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
