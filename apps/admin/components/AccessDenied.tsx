import Link from "next/link";
import { LockKey } from "@phosphor-icons/react/dist/ssr";

export function AccessDenied({
  title = "Você não tem acesso a esta área",
  description = "Seu perfil não tem permissão para visualizar este conteúdo. Fale com um proprietário se precisar de acesso.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-muted text-ink-muted">
        <LockKey size={26} weight="duotone" />
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
      <Link href="/" className="admin-btn-secondary">
        Voltar ao início
      </Link>
    </div>
  );
}
