"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { useTransition } from "react";
import { RANGE_LABELS, RANGE_ORDER, type Range } from "@/lib/data/analytics-shared";

type Props = {
  active: Range;
};

export function RangeSelector({ active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGE_ORDER.map((r) => (
        <Link
          key={r}
          href={`/analytics?range=${r}`}
          className={
            "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
            (r === active
              ? "border-ink bg-ink text-white"
              : "border-ink-faint bg-bg-card text-ink hover:border-ink")
          }
        >
          {RANGE_LABELS[r]}
        </Link>
      ))}
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-ink-faint bg-bg-card px-3 py-1.5 text-xs font-medium text-ink hover:border-ink disabled:opacity-50"
      >
        <ArrowsClockwise size={14} weight="bold" className={pending ? "animate-spin" : ""} />
        Atualizar
      </button>
    </div>
  );
}
