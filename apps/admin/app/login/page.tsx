import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      {/* Brilhos de fundo (sutis) */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-accent/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-bg-surface p-8 shadow-2xl sm:p-10">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src={KANPAI_BLUE_LOGO_URL}
              alt="Kanpai Blue"
              width={KANPAI_BLUE_LOGO_WIDTH}
              height={KANPAI_BLUE_LOGO_HEIGHT}
              priority
              className="h-11 w-auto"
            />
          </div>

          {/* Cabeçalho */}
          <div className="mt-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Acesso administrativo
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Entrar no painel
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">
              Gerencie pratos e categorias do cardápio.
            </p>
          </div>

          {/* Formulário */}
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          Kanpai Blue · Admin
        </p>
      </div>
    </main>
  );
}
