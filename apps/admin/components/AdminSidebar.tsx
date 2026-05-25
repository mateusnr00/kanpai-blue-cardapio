"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowSquareOut,
  SignOut,
  BookOpenText,
  SquaresFour,
  ChartLineUp,
} from "@phosphor-icons/react";
import { NavLink } from "./NavLink";
import { RestaurantSelector } from "./RestaurantSelector";
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";
import { restaurantPublicUrl, type RestaurantRow } from "@/lib/restaurants-shared";

const NAV = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true },
  { href: "/cards", label: "Categorias", icon: SquaresFour },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp },
] as const;

type Props = {
  email: string | null;
  activeRestaurant: string;
  restaurants: RestaurantRow[];
};

export function AdminSidebar({ email, activeRestaurant, restaurants }: Props) {
  return (
    <aside className="admin-sidebar">
      <div className="sticky top-0 flex h-screen flex-col">
        <Link href="/" className="admin-sidebar-brand" aria-label="Kanpai Blue Admin">
          <Image
            src={KANPAI_BLUE_LOGO_URL}
            alt="Kanpai Blue"
            width={KANPAI_BLUE_LOGO_WIDTH}
            height={KANPAI_BLUE_LOGO_HEIGHT}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">Menu</p>
        <nav className="admin-sidebar-nav">
          {NAV.map(({ href, label, icon, ...rest }) => (
            <NavLink key={href} href={href} icon={icon} layout="sidebar" {...rest}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="admin-sidebar-footer">
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
