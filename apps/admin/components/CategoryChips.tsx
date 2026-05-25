"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AdminSelect } from "./AdminSelect";
import type { CategoryListItem } from "@/lib/data/categories";

type Props = {
  categories: CategoryListItem[];
  selectedId?: string;
};

export function CategoryChips({ categories, selectedId: selectedIdProp }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = selectedIdProp ?? searchParams.get("cat") ?? categories[0]?.id ?? "";

  function onCategoryChange(catId: string) {
    router.push(`/?cat=${catId}`);
  }

  if (categories.length === 0) return null;

  return (
    <div className="max-w-md">
      <label htmlFor="cardapio-category" className="admin-label">
        Categoria
      </label>
      <AdminSelect
        id="cardapio-category"
        value={selectedId}
        onChange={onCategoryChange}
        options={categories.map((cat) => ({
          value: cat.id,
          label: `${cat.name} (${cat.active}/${cat.total})`,
        }))}
        className="mt-1.5"
      />
    </div>
  );
}
