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
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";
import { RestaurantSelector } from "./RestaurantSelector";
import { ActiveUnitLogo } from "./ActiveUnitLogo";
import { restaurantPublicUrl, type RestaurantRow } from "@/lib/restaurants-shared";
import { ADMIN_NAV } from "@/lib/admin-nav";

type Props = {
  email: string | null;
  activeRestaurant: string;
  restaurants: RestaurantRow[];
  unreadReviews?: number;
};

export function MobileTopBar({ email, activeRestaurant, restaurants, unreadReviews = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const badges: Record<string, number> = { unreadReviews };

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
    <header className="sticky top-0 z-40 border-b border-ink-ghost bg-bg-surface/95 shadow-sm backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center" aria-label="Kanpai Blue Admin">
          <Image
            src={KANPAI_BLUE_LOGO_URL}
            alt="Kanpai Blue"
            width={KANPAI_BLUE_LOGO_WIDTH}
            height={KANPAI_BLUE_LOGO_HEIGHT}
            className="h-6 w-auto"
            priority
          />
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
        <div className="max-h-[calc(100dvh-56px)] overflow-y-auto border-t border-ink-ghost bg-bg-surface px-4 py-3">
          <div className="flex flex-col gap-3">
            <ActiveUnitLogo
              restaurantId={activeRestaurant}
              name={restaurants.find((r) => r.id === activeRestaurant)?.short_name ?? ""}
              size={64}
            />
            <RestaurantSelector active={activeRestaurant} restaurants={restaurants} />

            <nav className="flex flex-col gap-0.5 border-t border-ink-ghost pt-3">
              {ADMIN_NAV.map(({ href, label, icon: Icon, exact, badgeKey }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(href + "/");
                const badge = badgeKey ? badges[badgeKey] : 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
                      (active
                        ? "bg-accent-soft text-accent"
                        : "text-ink-secondary hover:bg-bg-muted hover:text-ink")
                    }
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon size={18} weight={active ? "fill" : "duotone"} />
                      {label}
                    </span>
                    {badge > 0 ? (
                      <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <a
              href={restaurantPublicUrl(activeRestaurant)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-lg border-t border-ink-ghost px-3 py-2.5 pt-5 text-sm text-ink-muted hover:bg-bg-muted"
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
