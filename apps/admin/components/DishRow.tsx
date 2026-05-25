"use client";

import Image from "next/image";
import Link from "next/link";
import { publicImageUrl } from "@/lib/storage";
import { DishToggleActive } from "./DishToggleActive";
import { DishDeleteButton } from "./DishDeleteButton";
import type { DishListRow } from "@/lib/data/dishes";

type Props = {
  dish: DishListRow;
  dragHandle?: React.ReactNode;
};

export function DishRow({ dish, dragHandle }: Props) {
  const img = publicImageUrl(dish.image_path);
  return (
    <tr className="border-b border-ink-trace last:border-b-0">
      <td className="w-8 py-3 pr-2 text-ink-faint">{dragHandle}</td>
      <td className="w-14 py-3 pr-3 sm:w-16">
        {img ? (
          <Image
            src={img}
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-ink-ghost sm:h-12 sm:w-12" />
        )}
      </td>
      <td className="py-3 pr-3 sm:pr-4">
        <div className="text-sm font-medium uppercase tracking-tight">{dish.name}</div>
        {dish.description ? (
          <div className="line-clamp-1 max-w-xl text-xs text-ink-soft">{dish.description}</div>
        ) : null}
        <div className="mt-1 text-xs text-ink-soft sm:hidden">{dish.price ?? "—"}</div>
      </td>
      <td className="hidden w-24 whitespace-nowrap py-3 pr-4 text-sm sm:table-cell">{dish.price ?? "—"}</td>
      <td className="w-16 py-3 pr-3">
        <DishToggleActive id={dish.id} active={dish.active} />
      </td>
      <td className="w-28 py-3 pr-2 text-right sm:w-32">
        <Link
          href={`/dishes/${dish.id}`}
          className="mr-2 inline-block rounded-md border border-ink-faint px-2 py-1 text-xs font-medium hover:border-ink sm:mr-3 sm:px-3"
        >
          Editar
        </Link>
        <DishDeleteButton id={dish.id} name={dish.name} />
      </td>
    </tr>
  );
}
