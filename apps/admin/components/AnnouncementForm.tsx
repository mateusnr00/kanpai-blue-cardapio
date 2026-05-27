"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

type Props = {
  initialActive: boolean;
  initialImagePath: string | null;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

export function AnnouncementForm({ initialActive, initialImagePath, onSubmit }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(initialActive);

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Aviso atualizado");
      }
    });
  }

  return (
    <form action={action} className="flex w-full flex-col gap-6">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="announcement_active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="mt-1"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-ink">Mostrar o aviso no site</span>
          <span className="text-xs text-ink-muted">
            Quando ligado, o modal aparece na home do restaurante ativo. O cliente fecha clicando no X ou fora do
            modal — não aparece de novo na mesma sessão.
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <span className="admin-label">Imagem do aviso</span>
        <p className="text-xs text-ink-muted">
          Recomendado: formato retrato (ex.: 1080×1620) ou quadrado. Imagem inteira aparece (object-fit contain).
        </p>
        <ImageUpload name="announcement_image" initialPath={initialImagePath} />
      </div>

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}

      <div>
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
