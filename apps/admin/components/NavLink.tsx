"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";

type Props = {
  href: string;
  children: React.ReactNode;
  icon: Icon;
  exact?: boolean;
  onNavigate?: () => void;
  /** sidebar: item largo com barra lateral ativa */
  layout?: "sidebar" | "inline";
  /** Pill numerico no canto direito; some quando 0/undefined. */
  badge?: number;
};

export function NavLink({
  href,
  children,
  icon: IconComponent,
  exact,
  onNavigate,
  layout = "sidebar",
  badge,
}: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const base =
    layout === "sidebar"
      ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition "
      : "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ";

  const activeCls =
    layout === "sidebar"
      ? "border-l-[3px] border-accent bg-accent-soft pl-[9px] text-accent shadow-sm"
      : "bg-accent-soft text-accent";

  const inactiveCls =
    layout === "sidebar"
      ? "border-l-[3px] border-transparent text-ink-secondary hover:bg-bg-muted hover:text-ink"
      : "text-ink-secondary hover:bg-bg-muted hover:text-ink";

  return (
    <Link href={href} onClick={onNavigate} className={base + (active ? activeCls : inactiveCls)}>
      <IconComponent
        size={layout === "sidebar" ? 20 : 18}
        weight={active ? "fill" : "duotone"}
        className={active ? "text-accent" : "text-ink-muted"}
      />
      <span className="flex-1">{children}</span>
      {badge && badge > 0 ? (
        <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
