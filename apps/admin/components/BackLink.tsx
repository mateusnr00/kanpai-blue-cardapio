import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type Props = {
  href: string;
  children?: React.ReactNode;
};

export function BackLink({ href, children = "Voltar" }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
    >
      <ArrowLeft size={16} weight="bold" />
      {children}
    </Link>
  );
}
