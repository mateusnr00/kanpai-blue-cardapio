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
};

export function NavLink({ href, children, icon: IconComponent, exact, onNavigate }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={
        "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition " +
        (active
          ? "bg-accent-soft text-accent"
          : "text-ink-secondary hover:bg-bg-muted hover:text-ink")
      }
    >
      <IconComponent
        size={18}
        weight={active ? "fill" : "duotone"}
        className={active ? "text-accent" : "text-ink-muted"}
      />
      {children}
    </Link>
  );
}
