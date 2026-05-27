import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { publicImageUrl } from "@/lib/storage";
import { DishToggleActive } from "./DishToggleActive";
import { DishDeleteButton } from "./DishDeleteButton";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  dishes: DishListRow[];
};

export function DishesTable({ dishes }: Props) {
  if (dishes.length === 0) {
    return (
      <div className="admin-empty">
        Nenhum prato nesta categoria.
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      {dishes.map((d) => {
        const img = publicImageUrl(d.image_path);
        return (
          <article
            key={d.id}
            className="border-b border-ink-ghost/60 last:border-b-0 transition hover:bg-bg-muted/30"
          >
            <div className="flex items-start gap-3 p-3 sm:items-center sm:p-4">
              {img ? (
                <Image
                  src={img}
                  alt=""
                  width={56}
                  height={56}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-ink-ghost sm:h-14 sm:w-14"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-muted text-ink-faint sm:h-14 sm:w-14">
                  <ImageIcon size={20} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                {d.description ? (
                  <p className="line-clamp-1 text-xs text-ink-muted">{d.description}</p>
                ) : null}
                {d.price ? (
                  <p className="mt-1 text-xs font-medium tabular-nums text-ink-muted sm:hidden">
                    {d.price}
                  </p>
                ) : null}
              </div>

              {d.price ? (
                <span className="hidden whitespace-nowrap text-sm font-medium tabular-nums text-ink sm:block">
                  {d.price}
                </span>
              ) : null}

              <DishToggleActive id={d.id} active={d.active} />
            </div>

            <div className="flex items-center justify-end gap-1 border-t border-ink-ghost/40 bg-bg-muted/30 px-3 py-1.5 sm:px-4">
              <Link href={`/dishes/${d.id}`} className="admin-btn-ghost">
                <PencilSimple size={16} />
                Editar
              </Link>
              <DishDeleteButton id={d.id} name={d.name} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
