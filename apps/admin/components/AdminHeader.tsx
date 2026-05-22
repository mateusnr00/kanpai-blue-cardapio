import Image from "next/image";
import { NavLink } from "./NavLink";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type Props = {
  email: string | null;
};

export function AdminHeader({ email }: Props) {
  return (
    <header className="border-b border-ink-faint bg-bg-warm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <a href="/" aria-label="Kanpai Admin" className="block">
            <Image src={LOGO_URL} alt="Kanpai Blue" width={32} height={32} />
          </a>
          <nav className="flex items-center gap-6">
            <NavLink href="/" exact>Cardápio</NavLink>
            <NavLink href="/cards">Cards</NavLink>
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

        <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}
