"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  BookOpenText,
  Briefcase,
  ChartLineUp,
  List,
  SignOut,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import { NavLink } from "./NavLink";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

const NAV = [
  { href: "/", label: "Cardápio", icon: BookOpenText, exact: true },
  { href: "/cards", label: "Cards", icon: SquaresFour },
  { href: "/executivos", label: "Executivos", icon: Briefcase },
  { href: "/analytics", label: "Analytics", icon: ChartLineUp },
] as const;

type Props = {
  email: string | null;
};

export function AdminNavbar({ email }: Props) {
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
    <header className="sticky top-0 z-40 border-b border-ink-ghost/80 bg-bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Kanpai Admin">
          <Image src={LOGO_URL} alt="" width={28} height={28} className="rounded-md" />
          <span className="hidden text-sm font-semibold text-ink sm:block">Kanpai Admin</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 md:flex">
          {NAV.map(({ href, label, icon, ...rest }) => (
            <NavLink key={href} href={href} icon={icon} {...rest}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <a
            href="https://kanpai-blue.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted transition hover:bg-bg-muted hover:text-ink"
          >
            <ArrowSquareOut size={16} weight="duotone" />
            <span className="hidden lg:inline">Site</span>
          </a>
          {email ? (
            <span className="hidden max-w-[140px] truncate text-xs text-ink-faint xl:inline" title={email}>
              {email}
            </span>
          ) : null}
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-secondary transition hover:bg-bg-muted hover:text-ink"
            >
              <SignOut size={16} weight="duotone" />
              Sair
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink-ghost bg-bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon, ...rest }) => (
              <NavLink key={href} href={href} icon={icon} onNavigate={() => setOpen(false)} {...rest}>
                {label}
              </NavLink>
            ))}
            <a
              href="https://kanpai-blue.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-bg-muted"
            >
              <ArrowSquareOut size={18} weight="duotone" />
              Ver site público
            </a>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink-ghost pt-3">
              {email ? <span className="truncate text-xs text-ink-faint">{email}</span> : <span />}
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="admin-btn-secondary text-xs">
                  <SignOut size={16} />
                  Sair
                </button>
              </form>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
