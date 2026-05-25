"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, SquaresFour, ChartLineUp } from "@phosphor-icons/react";

const NAV = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true },
  { href: "/cards", label: "Categorias", icon: SquaresFour },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-ink-ghost bg-bg-surface md:hidden">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={
              "flex flex-col items-center gap-1 px-3 py-1 text-center transition " +
              (active ? "text-accent" : "text-ink-muted")
            }
          >
            <Icon size={20} weight={active ? "fill" : "duotone"} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
