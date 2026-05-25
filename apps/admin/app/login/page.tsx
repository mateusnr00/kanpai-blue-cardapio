import Image from "next/image";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/LoginForm";
import { KANPAI_BLUE_LOGO_URL, KANPAI_BLUE_LOGO_HEIGHT, KANPAI_BLUE_LOGO_WIDTH } from "@/lib/brand";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Image
          src={KANPAI_BLUE_LOGO_URL}
          alt="Kanpai Blue"
          width={KANPAI_BLUE_LOGO_WIDTH}
          height={KANPAI_BLUE_LOGO_HEIGHT}
          className="h-10 w-auto brightness-0 invert"
          priority
        />
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Gestão do cardápio
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Atualize pratos e categorias do cardápio. As mudanças refletem no site em tempo real.
          </p>
        </div>
        <p className="text-xs text-white/40">Kanpai Blue · Admin</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 lg:items-start">
            <Image
              src={KANPAI_BLUE_LOGO_URL}
              alt="Kanpai Blue"
              width={KANPAI_BLUE_LOGO_WIDTH}
              height={KANPAI_BLUE_LOGO_HEIGHT}
              priority
              className="h-8 w-auto lg:hidden"
            />
            <div className="flex items-center gap-2 text-ink-muted">
              <LockKey size={20} weight="duotone" />
              <span className="text-sm font-medium">Acesso administrativo</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Entrar no painel</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
