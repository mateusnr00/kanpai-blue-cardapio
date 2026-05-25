"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AdminSelect } from "./AdminSelect";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  categories: CategoryListItem[];
  selectedSlug?: string;
};

export function CategoryChips({ categories, selectedSlug: selectedSlugProp }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSlug = selectedSlugProp ?? searchParams.get("cat") ?? categories[0]?.slug ?? "";

  function onCategoryChange(slug: string) {
    router.push(`/?cat=${slug}`);
  }

  if (categories.length === 0) return null;

  return (
    <div className="max-w-md">
      <label htmlFor="cardapio-category" className="admin-label">
        Categoria
      </label>
      <AdminSelect
        id="cardapio-category"
        value={selectedSlug}
        onChange={onCategoryChange}
        options={categories.map((cat) => ({
          value: cat.slug,
          label: `${cat.name} (${cat.active}/${cat.total})`,
        }))}
        className="mt-1.5"
      />
    </div>
  );
}
