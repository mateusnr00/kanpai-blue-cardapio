"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import {
  CalendarBlank,
  CaretDown,
  SquaresFour,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { RANGE_LABELS, RANGE_ORDER, type Range } from "@/lib/data/analytics-shared";

type CategoryOption = { slug: string; name: string; id: string };

type Props = {
  activeRange: Range;
  activeCategory: string | null;
  categories: CategoryOption[];
};

function Dropdown({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ size: number; weight: string }>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-ink-ghost bg-bg-surface px-4 py-2 text-sm text-ink transition hover:border-ink-faint"
      >
        <Icon size={16} weight="duotone" />
        <span>{label}</span>
        <CaretDown size={14} weight="bold" className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-ink-ghost bg-bg-surface py-1 shadow-lg"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function buildHref(range: Range, category: string | null): string {
  const params = new URLSearchParams();
  params.set("range", range);
  if (category) params.set("category", category);
  return `/analytics?${params.toString()}`;
}

export function AnalyticsFilters({ activeRange, activeCategory, categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown
        label={RANGE_LABELS[activeRange]}
        icon={CalendarBlank}
      >
        {RANGE_ORDER.map((r) => (
          <Link
            key={r}
            href={buildHref(r, activeCategory)}
            className={
              "block px-4 py-2 text-sm transition hover:bg-bg-muted " +
              (r === activeRange ? "bg-accent-soft font-medium text-accent" : "text-ink")
            }
          >
            {RANGE_LABELS[r]}
          </Link>
        ))}
      </Dropdown>

      <Dropdown
        label={
          activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name ?? "Categoria"
            : "Todas categorias"
        }
        icon={SquaresFour}
      >
        <Link
          href={buildHref(activeRange, null)}
          className={
            "block px-4 py-2 text-sm transition hover:bg-bg-muted " +
            (!activeCategory ? "bg-accent-soft font-medium text-accent" : "text-ink")
          }
        >
          Todas categorias
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={buildHref(activeRange, c.slug)}
            className={
              "block px-4 py-2 text-sm transition hover:bg-bg-muted " +
              (activeCategory === c.slug ? "bg-accent-soft font-medium text-accent" : "text-ink")
            }
          >
            {c.name}
          </Link>
        ))}
      </Dropdown>

      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-ghost bg-bg-surface text-ink-muted transition hover:border-ink-faint hover:text-ink disabled:opacity-50"
        aria-label="Atualizar"
      >
        <ArrowsClockwise size={16} weight="bold" className={pending ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
