"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowSquareOut, SignOut } from "@phosphor-icons/react";
import { NavLink } from "./NavLink";
import { RestaurantSelector } from "./RestaurantSelector";
import { ActiveUnitLogo } from "./ActiveUnitLogo";
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";
import { restaurantPublicUrl, type RestaurantRow } from "@/lib/restaurants-shared";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";

type Props = {
  email: string | null;
  activeRestaurant: string;
  restaurants: RestaurantRow[];
  unreadReviews?: number;
};

export function AdminSidebar({ email, activeRestaurant, restaurants, unreadReviews = 0 }: Props) {
  const badges: Record<string, number> = { unreadReviews };
  return (
    <aside className="admin-sidebar">
      <div className="sticky top-0 flex h-screen flex-col">
        <Link href="/" className="admin-sidebar-brand shrink-0" aria-label="Kanpai Blue Admin">
          <Image
            src={KANPAI_BLUE_LOGO_URL}
            alt="Kanpai Blue"
            width={KANPAI_BLUE_LOGO_WIDTH}
            height={KANPAI_BLUE_LOGO_HEIGHT}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.title} className="mt-4 first:mt-1">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                {group.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ href, label, icon, badgeKey, ...rest }) => (
                  <NavLink
                    key={href}
                    href={href}
                    icon={icon}
                    layout="sidebar"
                    badge={badgeKey ? badges[badgeKey] : undefined}
                    {...rest}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer shrink-0">
          <ActiveUnitLogo
            restaurantId={activeRestaurant}
            name={restaurants.find((r) => r.id === activeRestaurant)?.short_name ?? ""}
          />
          <RestaurantSelector active={activeRestaurant} restaurants={restaurants} fullWidth />

          <a
            href={restaurantPublicUrl(activeRestaurant)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-muted transition hover:bg-bg-surface hover:text-ink"
          >
            <ArrowSquareOut size={16} weight="duotone" />
            Ver site público
          </a>

          <div className="rounded-lg bg-bg-surface px-3 py-3 ring-1 ring-ink-ghost/80">
            {email ? (
              <p className="mb-2 truncate text-xs text-ink-muted" title={email}>
                {email}
              </p>
            ) : null}
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-ghost bg-bg-surface px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-ink-faint hover:bg-bg-muted hover:text-ink"
              >
                <SignOut size={16} weight="duotone" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
