import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image
          src={LOGO_URL}
          alt="Kanpai Blue"
          width={140}
          height={140}
          priority
        />
        <h1 className="text-base font-medium tracking-tight">Painel administrativo</h1>
        <LoginForm />
      </div>
    </main>
  );
}
