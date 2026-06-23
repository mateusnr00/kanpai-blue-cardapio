"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminSelect } from "./AdminSelect";
import { ImageUpload } from "./ImageUpload";
import { BadgeCheckboxes } from "./BadgeCheckboxes";
import { VariantsEditor } from "./VariantsEditor";
import { DishComponentsEditor } from "./DishComponentsEditor";
import { ScheduleEditor } from "./ScheduleEditor";
import { OtherUnitsField } from "./OtherUnitsField";
import type { DishDetail, DishVariantRow, DishComponentRow } from "@/lib/data/dishes";
import type { CategoryListItem } from "@/lib/data/categories";

type ComponentChoice = {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  price: string | null;
  active: boolean;
  foreign?: boolean;
  unitName?: string;
};

type Props = {
  mode: "create" | "edit";
  initial?: DishDetail;
  variants?: DishVariantRow[];
  components?: DishComponentRow[];
  componentChoices?: ComponentChoice[];
  categories: CategoryListItem[];
  defaultCategoryId?: string;
  /** Outras unidades ativas — habilita "criar também em" (só na criação). */
  otherUnits?: Array<{ id: string; shortName: string }>;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
  /** Quando true: oculta editor de componentes aninhados e o link "Editar detalhes". Usado no modal. */
  embedded?: boolean;
  /** Override do botao Cancelar. Default: router.back(). */
  onCancel?: () => void;
  /** Disparado apos submit OK. Util pro modal fechar e adicionar o prato criado como componente. */
  onSuccess?: () => void;
  submitLabel?: string;
};

export function DishForm({
  mode,
  initial,
  variants = [],
  components = [],
  componentChoices = [],
  categories,
  defaultCategoryId,
  otherUnits = [],
  onSubmit,
  embedded = false,
  onCancel,
  onSuccess,
  submitLabel,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success(mode === "create" ? "Prato criado" : "Salvo");
        onSuccess?.();
      }
    });
  }

  const initialCategoryId = initial?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "";
  const [currentCategoryId, setCurrentCategoryId] = useState(initialCategoryId);
  const [featured, setFeatured] = useState<boolean>(initial?.featured ?? false);

  // provisorio: Festival sempre 16:9, mesmo sem marcar destaque
  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  const isFestivalCategory =
    (currentCategory?.slug ?? "").toLowerCase().includes("festival") ||
    (currentCategory?.name ?? "").toLowerCase().includes("festival");

  const photoAspect = featured || isFestivalCategory ? 16 / 9 : 1;
  const photoMaxSize = featured || isFestivalCategory ? 1920 : 1200;

  return (
    <form action={action} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="admin-label">Nome</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initial?.name ?? ""}
            className="admin-input"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category_id" className="admin-label">Categoria</label>
          <AdminSelect
            id="category_id"
            name="category_id"
            required
            value={currentCategoryId}
            onChange={setCurrentCategoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="admin-label">Descrição</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="admin-input"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="admin-label">Preço (texto, ex: R$ 82,90)</label>
          <input
            id="price"
            name="price"
            type="text"
            defaultValue={initial?.price ?? ""}
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="original_price" className="admin-label">Preço antes (promo, opcional)</label>
          <input
            id="original_price"
            name="original_price"
            type="text"
            defaultValue={initial?.original_price ?? ""}
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subcategory" className="admin-label">Subcategoria (opcional)</label>
          <input
            id="subcategory"
            name="subcategory"
            type="text"
            defaultValue={initial?.subcategory ?? ""}
            className="admin-input"
          />
        </div>
      </div>

      <VariantsEditor initial={variants} />

      {embedded ? null : (
        <DishComponentsEditor
          initial={components}
          initialLabels={initial?.component_labels ?? null}
          choices={componentChoices}
          categories={categories}
          parentCategoryId={currentCategoryId}
          otherUnits={otherUnits}
        />
      )}

      {embedded ? null : (
        <ScheduleEditor
          initialStart={(initial as { schedule_start?: string | null } | undefined)?.schedule_start ?? null}
          initialEnd={(initial as { schedule_end?: string | null } | undefined)?.schedule_end ?? null}
          initialOffDays={(initial as { schedule_off_days?: number[] | null } | undefined)?.schedule_off_days ?? null}
        />
      )}

      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          name="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-ink-ghost text-accent focus:ring-accent/30"
        />
        Prato em destaque (linha cheia 16:9 + badge)
      </label>

      {featured ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="featured_label" className="admin-label">
            Texto do badge de destaque
          </label>
          <input
            id="featured_label"
            name="featured_label"
            type="text"
            defaultValue={initial?.featured_label ?? ""}
            placeholder="DESTAQUE"
            maxLength={32}
            className="admin-input max-w-xs uppercase"
          />
          <p className="text-xs text-ink-muted">
            Aparece no canto direito da foto. Deixe vazio para usar &ldquo;DESTAQUE&rdquo;.
            Ex.: NOVO, MAIS PEDIDO, PROMOÇÃO, EXCLUSIVO.
          </p>
        </div>
      ) : null}

      {mode === "create" && otherUnits.length > 0 ? (
        <OtherUnitsField units={otherUnits} kind="prato" />
      ) : null}

        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-20">
          <div className="flex flex-col gap-2">
            <span className="admin-label">Foto</span>
            <ImageUpload
              name="image"
              initialPath={initial?.image_path ?? null}
              aspect={photoAspect}
              maxOutputSize={photoMaxSize}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="admin-label">Badges</span>
            <BadgeCheckboxes initial={initial?.badges ?? []} />
          </div>
        </aside>
      </div>

      {!embedded && mode === "edit" && initial ? (
        <div className="flex flex-col gap-3 rounded-xl border border-ink-ghost bg-bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Detalhes (texto longo + seções)</p>
            <p className="text-xs text-ink-muted">
              Modal &quot;Ver itens&quot; no cardápio. Use para Festival Premium e menus com mais texto.
            </p>
          </div>
          <a href={`/dishes/${initial.id}/details`} className="admin-btn-secondary shrink-0 self-start sm:self-auto">
            Editar detalhes
          </a>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-ink-ghost pt-6">
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "Salvando..." : submitLabel ?? (mode === "create" ? "Criar item" : "Salvar")}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="admin-btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
