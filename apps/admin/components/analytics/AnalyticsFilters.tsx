"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState, useRef, useEffect } from "react";
import {
  CalendarBlank,
  CaretDown,
  SquaresFour,
  ArrowsClockwise,
  Eye,
  EyeSlash,
  type Icon,
} from "@phosphor-icons/react";
import { RANGE_LABELS, RANGE_ORDER, type Range } from "@/lib/data/analytics-shared";

type CategoryOption = { slug: string; name: string; id: string };

type Props = {
  activeRange: Range;
  activeCategory: string | null;
  categories: CategoryOption[];
  detailed: boolean;
};

function FilterDropdown({
  label,
  icon: IconComponent,
  children,
}: {
  label: string;
  icon: Icon;
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
        className={
          "inline-flex items-center gap-2 rounded-lg border border-ink-ghost bg-bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent/40 hover:bg-accent-soft/30 " +
          (open ? "border-accent ring-2 ring-accent-soft" : "")
        }
      >
        <IconComponent size={16} weight="duotone" className="text-accent" />
        <span>{label}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={"text-ink-muted transition " + (open ? "rotate-180" : "")}
        />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-ink-ghost bg-bg-surface py-1 shadow-lg"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        "block px-4 py-2.5 text-sm transition " +
        (active ? "bg-accent font-medium text-white" : "text-ink hover:bg-bg-muted")
      }
    >
      {children}
    </Link>
  );
}

function buildHref(range: Range, category: string | null, detailed?: boolean): string {
  const params = new URLSearchParams();
  params.set("range", range);
  if (category) params.set("category", category);
  if (detailed) params.set("detailed", "1");
  return `/analytics?${params.toString()}`;
}

export function AnalyticsFilters({ activeRange, activeCategory, categories, detailed }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label={RANGE_LABELS[activeRange]} icon={CalendarBlank}>
        {RANGE_ORDER.map((r) => (
          <FilterLink key={r} href={buildHref(r, activeCategory, detailed)} active={r === activeRange}>
            {RANGE_LABELS[r]}
          </FilterLink>
        ))}
      </FilterDropdown>

      <FilterDropdown
        label={
          activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name ?? "Categoria"
            : "Todas as categorias"
        }
        icon={SquaresFour}
      >
        <FilterLink href={buildHref(activeRange, null, detailed)} active={!activeCategory}>
          Todas as categorias
        </FilterLink>
        {categories.map((c) => (
          <FilterLink
            key={c.slug}
            href={buildHref(activeRange, c.slug, detailed)}
            active={activeCategory === c.slug}
          >
            {c.name}
          </FilterLink>
        ))}
      </FilterDropdown>

      <Link
        href={buildHref(activeRange, activeCategory, !detailed)}
        className={
          "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium shadow-sm transition " +
          (detailed
            ? "border-accent bg-accent-soft text-accent hover:bg-accent-soft"
            : "border-ink-ghost bg-bg-surface text-ink hover:border-accent/40 hover:bg-accent-soft/30")
        }
      >
        {detailed ? <EyeSlash size={16} weight="duotone" /> : <Eye size={16} weight="duotone" />}
        <span>{detailed ? "Resumo" : "Ver detalhes"}</span>
      </Link>

      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-ink-ghost bg-bg-surface text-ink-muted shadow-sm transition hover:border-accent/40 hover:bg-accent-soft/30 hover:text-accent disabled:opacity-50"
        aria-label="Atualizar dados"
      >
        <ArrowsClockwise size={18} weight="bold" className={pending ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
