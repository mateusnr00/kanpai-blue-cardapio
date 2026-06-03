"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlass, X, Image as ImageIcon } from "@phosphor-icons/react";
import { publicImageUrl } from "@/lib/storage";
import type { DishSearchRow } from "@/lib/data/dishes";

type Props = {
  dishes: DishSearchRow[];
};

/** Remove acentos e baixa caixa pra busca tolerante. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, "");
}

const MAX_RESULTS = 12;

export function DishSearch({ dishes }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return dishes
      .filter((d) => norm(d.name).includes(q) || norm(d.categoryName).includes(q) || (d.subcategory ? norm(d.subcategory).includes(q) : false))
      .slice(0, MAX_RESULTS);
  }, [query, dishes]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlass
          size={18}
          weight="bold"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar item por nome ou categoria..."
          className="admin-input w-full pl-10 pr-10"
          aria-label="Buscar item"
        />
        {hasQuery ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-faint transition hover:bg-bg-muted hover:text-ink"
            aria-label="Limpar busca"
          >
            <X size={16} weight="bold" />
          </button>
        ) : null}
      </div>

      {hasQuery ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-[60vh] overflow-y-auto rounded-xl border border-ink-ghost bg-bg-surface py-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">Nenhum item encontrado para “{query.trim()}”.</p>
          ) : (
            <ul>
              {results.map((d) => {
                const img = publicImageUrl(d.image_path);
                return (
                  <li key={d.id}>
                    <Link
                      href={`/dishes/${d.id}`}
                      className="flex items-center gap-3 px-3 py-2 transition hover:bg-bg-muted"
                    >
                      {img ? (
                        <Image
                          src={img}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-ink-ghost"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-muted text-ink-faint">
                          <ImageIcon size={18} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {d.categoryName}
                          {d.subcategory ? ` · ${d.subcategory}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {d.price ? (
                          <span className="text-xs font-medium tabular-nums text-ink-muted">{d.price}</span>
                        ) : null}
                        {!d.active ? (
                          <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
                            Inativo
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
