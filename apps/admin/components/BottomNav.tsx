"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, SquaresFour, ChartLineUp, Star } from "@phosphor-icons/react";

type Props = {
  unreadReviews?: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof BookOpenText;
  exact: boolean;
  badgeKey: "unreadReviews" | null;
};

const NAV: NavItem[] = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true, badgeKey: null },
  { href: "/cards", label: "Categorias", icon: SquaresFour, exact: false, badgeKey: null },
  { href: "/reviews", label: "Avaliações", icon: Star, exact: false, badgeKey: "unreadReviews" },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp, exact: false, badgeKey: null },
];

export function BottomNav({ unreadReviews = 0 }: Props = {}) {
  const pathname = usePathname();
  const badges: Record<string, number> = { unreadReviews };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-ink-ghost bg-bg-surface/95 shadow-[0_-4px_24px_rgba(26,14,110,0.06)] backdrop-blur-md md:hidden">
      {NAV.map(({ href, label, icon: Icon, exact, badgeKey }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        const badge = badgeKey ? badges[badgeKey] : 0;
        return (
          <Link
            key={href}
            href={href}
            className={
              "relative flex flex-col items-center gap-1 px-3 py-1 text-center transition " +
              (active ? "text-accent" : "text-ink-secondary")
            }
          >
            <span className="relative">
              <Icon size={20} weight={active ? "fill" : "duotone"} />
              {badge > 0 ? (
                <span className="absolute -right-2 -top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
