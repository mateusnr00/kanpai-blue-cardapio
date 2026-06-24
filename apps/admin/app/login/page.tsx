import Image from "next/image";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/LoginForm";
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-bg-app">
      {/* Painel de marca (somente desktop) */}
      <div className="relative hidden flex-1 flex-col overflow-hidden bg-ink p-12 text-white lg:flex">
        {/* Brilhos decorativos */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        {/* Bloco de marca: logo + título + descrição, centralizado verticalmente */}
        <div className="relative flex flex-1 flex-col justify-center">
          <Image
            src={KANPAI_BLUE_LOGO_URL}
            alt="Kanpai Blue"
            width={KANPAI_BLUE_LOGO_WIDTH}
            height={KANPAI_BLUE_LOGO_HEIGHT}
            className="mb-10 h-9 w-auto brightness-0 invert"
            priority
          />
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Gestão do cardápio
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Atualize pratos e categorias do cardápio. As mudanças refletem no site em tempo real.
          </p>
        </div>

        <p className="relative text-xs text-white/40">Kanpai Blue · Admin</p>
      </div>

      {/* Painel de login */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo no topo (somente mobile/tablet) */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src={KANPAI_BLUE_LOGO_URL}
              alt="Kanpai Blue"
              width={KANPAI_BLUE_LOGO_WIDTH}
              height={KANPAI_BLUE_LOGO_HEIGHT}
              priority
              className="h-9 w-auto"
            />
          </div>

          <div className="admin-card p-7 sm:p-8">
            <div className="mb-7 flex flex-col gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <LockKey size={22} weight="duotone" />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-ink">Entrar no painel</h1>
                <p className="mt-1 text-sm text-ink-muted">Acesso administrativo · Kanpai Blue</p>
              </div>
            </div>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-ink-faint">
            Apenas equipe autorizada
          </p>
        </div>
      </div>
    </main>
  );
}
