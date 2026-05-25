"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavLink } from "./NavLink";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type Props = {
  email: string | null;
};

export function AdminHeader({ email }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Trava scroll do body quando o drawer está aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="border-b border-ink-faint bg-bg-warm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <div className="flex items-center gap-4 sm:gap-8">
          <a href="/" aria-label="Kanpai Admin" className="block">
            <Image src={LOGO_URL} alt="Kanpai Blue" width={32} height={32} />
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/" exact>Cardápio</NavLink>
            <NavLink href="/cards">Cards</NavLink>
            <NavLink href="/executivos">Executivos</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <a
              href="https://kanpai-blue.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              Ver site →
            </a>
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {email ? (
            <span className="text-xs text-ink-soft">{email}</span>
          ) : null}
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="text-sm font-medium text-ink transition hover:opacity-80"
            >
              Sair
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            {open ? (
              <path
                d="M5 5L17 17M17 5L5 17"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <>
                <path d="M3 6H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3 11H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3 16H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink-faint bg-bg-warm md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <MobileNavLink href="/" exact>Cardápio</MobileNavLink>
            <MobileNavLink href="/cards">Cards</MobileNavLink>
            <MobileNavLink href="/executivos">Executivos</MobileNavLink>
            <MobileNavLink href="/analytics">Analytics</MobileNavLink>
            <a
              href="https://kanpai-blue.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-2.5 text-sm text-ink-soft transition hover:bg-ink-trace"
            >
              Ver site →
            </a>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink-trace pt-3">
              {email ? (
                <span className="truncate text-xs text-ink-soft">{email}</span>
              ) : <span />}
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-ink-faint px-3 py-1.5 text-sm font-medium text-ink hover:border-ink"
                >
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

function MobileNavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <a
      href={href}
      className={
        "rounded-md px-3 py-2.5 text-sm transition " +
        (active
          ? "bg-ink-trace font-medium text-ink"
          : "text-ink-soft hover:bg-ink-trace hover:text-ink")
      }
    >
      {children}
    </a>
  );
}
