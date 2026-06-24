import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Painel de marca (somente desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-ink p-12 text-white lg:flex">
        {/* Brilhos decorativos sutis */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Gestão do cardápio
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Atualize pratos e categorias do cardápio. As mudanças refletem no site em tempo real.
          </p>
        </div>

        <p className="absolute bottom-12 left-12 text-xs text-white/40">Kanpai Blue · Admin</p>
      </div>

      {/* Painel de login */}
      <div className="flex flex-1 items-center justify-center bg-bg-surface px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo original sobre o branco */}
          <Image
            src={KANPAI_BLUE_LOGO_URL}
            alt="Kanpai Blue"
            width={KANPAI_BLUE_LOGO_WIDTH}
            height={KANPAI_BLUE_LOGO_HEIGHT}
            priority
            className="h-12 w-auto"
          />

          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Acesso administrativo
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Entrar no painel
            </h1>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
