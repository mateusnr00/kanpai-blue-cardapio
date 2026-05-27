"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GradientInput } from "./GradientInput";
import { ImageUpload } from "./ImageUpload";
import { SlideshowImagesEditor } from "./SlideshowImagesEditor";
import { SubcategoriesEditor } from "./SubcategoriesEditor";
import { ScheduleEditor } from "./ScheduleEditor";
import type { CategoryRow } from "@/lib/data/categories";

type Props = {
  mode: "create" | "edit";
  initial?: CategoryRow;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function CategoryForm({ mode, initial, onSubmit }: Props) {
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
        toast.success(mode === "create" ? "Categoria criada" : "Salvo");
      }
    });
  }

  return (
    <form action={action} className="flex w-full flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
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
          <label htmlFor="number" className="admin-label">Número (ex: 01)</label>
          <input
            id="number"
            name="number"
            type="text"
            required
            defaultValue={initial?.number ?? ""}
            className="admin-input"
          />
        </div>
      </div>

      {mode === "create" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="id" className="admin-label">
            Slug (deixa vazio pra gerar do nome — imutável depois)
          </label>
          <input
            id="id"
            name="id"
            type="text"
            pattern="[a-z0-9-]+"
            placeholder="ex: festival"
            className="admin-input font-mono"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="admin-label">Slug (imutável)</span>
          <code className="admin-input block font-mono text-ink">
            {initial?.id}
          </code>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="admin-label">Descrição (microcopy do card)</label>
        <input
          id="description"
          name="description"
          type="text"
          required
          defaultValue={initial?.description ?? ""}
          placeholder='ex: "2 menus · principal experiência da casa"'
          className="admin-input"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="item_count" className="admin-label">Item count (opcional)</label>
          <input
            id="item_count"
            name="item_count"
            type="text"
            defaultValue={initial?.item_count ?? ""}
            placeholder='ex: "2 menus"'
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail" className="admin-label">Detalhe (opcional)</label>
          <input
            id="detail"
            name="detail"
            type="text"
            defaultValue={initial?.detail ?? ""}
            placeholder='ex: "começo da refeição"'
            className="admin-input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="short_name" className="admin-label">Nome curto (opcional)</label>
          <input
            id="short_name"
            name="short_name"
            type="text"
            defaultValue={initial?.short_name ?? ""}
            className="admin-input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="admin-label">Foto da categoria (opcional — sobrescreve o gradient na home)</span>
        <ImageUpload
          name="image"
          initialPath={initial?.image_path ?? null}
          aspect={16 / 9}
          maxOutputSize={1920}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="admin-label">Slideshow (opcional — várias fotos rotacionando no card)</span>
        <p className="text-xs text-ink-muted">
          Se preencher, o card da home mostra um cross-fade entre as fotos em vez da foto única acima.
          Recomendado pra promoções, eventos e cards de destaque.
        </p>
        <SlideshowImagesEditor initial={initial?.slideshow_image_paths ?? []} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="admin-label">Gradient (CSS) — fallback quando não tem foto</span>
        <GradientInput name="gradient" defaultValue={initial?.gradient ?? "linear-gradient(135deg, #EDE7D4 0%, #DDD3B9 100%)"} />
      </div>

      <SubcategoriesEditor
        initial={initial?.subcategories ?? []}
        initialModes={initial?.subcategory_display_modes ?? {}}
      />

      <ScheduleEditor
        initialStart={(initial as { schedule_start?: string | null } | undefined)?.schedule_start ?? null}
        initialEnd={(initial as { schedule_end?: string | null } | undefined)?.schedule_end ?? null}
        initialOffDays={(initial as { schedule_off_days?: number[] | null } | undefined)?.schedule_off_days ?? null}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} />
        Categoria em destaque (borda azul Kanpai + placeholder em gradiente azul)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="full_width" defaultChecked={initial?.full_width ?? false} />
        Card ocupa a fileira inteira na home (empurra os próximos pra próxima linha)
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="display_mode" className="admin-label">Como exibir os itens dentro da categoria</label>
        <select
          id="display_mode"
          name="display_mode"
          defaultValue={initial?.display_mode ?? "grid"}
          className="admin-input"
        >
          <option value="grid">Cards com foto (padrão — pra pratos com foto)</option>
          <option value="list">Lista de texto (sem foto — bom pra bebidas, drinks, vinhos)</option>
        </select>
      </div>

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "Salvando..." : mode === "create" ? "Criar categoria" : "Salvar"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
