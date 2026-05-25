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
import type { RestaurantRow } from "@/lib/active-restaurant";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

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
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-ink-ghost md:bg-bg-surface">
      <div className="sticky top-0 flex h-screen flex-col">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <Image src={LOGO_URL} alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-semibold text-ink">Kanpai Admin</span>
        </Link>

        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ href, label, icon, ...rest }) => (
            <NavLink key={href} href={href} icon={icon} {...rest}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex flex-col gap-3 border-t border-ink-ghost px-4 py-4">
          <a
            href="https://kanpai-blue.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-muted transition hover:bg-bg-muted hover:text-ink"
          >
            <ArrowSquareOut size={16} weight="duotone" />
            Ver site
          </a>

          <RestaurantSelector active={activeRestaurant} restaurants={restaurants} />

          <div className="border-t border-ink-ghost pt-3">
            {email ? (
              <p className="mb-2 truncate px-2 text-xs text-ink-faint" title={email}>
                {email}
              </p>
            ) : null}
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-secondary transition hover:bg-bg-muted hover:text-ink"
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
