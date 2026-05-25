import Image from "next/image";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/LoginForm";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Image src={LOGO_URL} alt="Kanpai Blue" width={48} height={48} className="rounded-xl" />
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Gestão do cardápio
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Atualize pratos, categorias e menus executivos. As mudanças refletem no site em tempo real.
          </p>
        </div>
        <p className="text-xs text-white/40">Kanpai Blue · Admin</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 lg:items-start">
            <Image
              src={LOGO_URL}
              alt="Kanpai Blue"
              width={56}
              height={56}
              priority
              className="rounded-xl lg:hidden"
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
