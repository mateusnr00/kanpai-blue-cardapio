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
      <td className="w-16 py-3 pr-3">
        {img ? (
          <Image
            src={img}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-ink-ghost" />
        )}
      </td>
      <td className="py-3 pr-4">
        <div className="text-sm font-medium uppercase tracking-tight">{dish.name}</div>
        {dish.description ? (
          <div className="line-clamp-1 max-w-xl text-xs text-ink-soft">{dish.description}</div>
        ) : null}
      </td>
      <td className="w-24 whitespace-nowrap py-3 pr-4 text-sm">{dish.price ?? "—"}</td>
      <td className="w-16 py-3 pr-3">
        <DishToggleActive id={dish.id} active={dish.active} />
      </td>
      <td className="w-32 py-3 pr-2 text-right">
        <Link
          href={`/dishes/${dish.id}`}
          className="mr-3 rounded-md border border-ink-faint px-3 py-1 text-xs font-medium hover:border-ink"
        >
          Editar
        </Link>
        <DishDeleteButton id={dish.id} name={dish.name} />
      </td>
    </tr>
  );
}
