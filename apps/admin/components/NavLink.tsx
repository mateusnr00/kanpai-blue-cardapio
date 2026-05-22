"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
};

export function NavLink({ href, children, exact }: Props) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={
        "text-sm transition " +
        (active ? "font-medium text-ink" : "text-ink-soft hover:text-ink")
      }
    >
      {children}
    </Link>
  );
}
