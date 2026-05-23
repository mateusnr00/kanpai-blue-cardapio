"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  categories: CategoryListItem[];
};

export function CategoryChips({ categories }: Props) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("cat") ?? categories[0]?.id;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <Link
            key={cat.id}
            href={`/?cat=${cat.id}`}
            className={
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
              (active
                ? "border-ink bg-ink text-white"
                : "border-ink-faint bg-bg-card text-ink hover:border-ink")
            }
          >
            {cat.name} <span className="ml-1 opacity-70">{cat.active}/{cat.total}</span>
          </Link>
        );
      })}
    </div>
  );
}
