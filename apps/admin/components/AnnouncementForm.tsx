"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

type Props = {
  initialActive: boolean;
  initialImagePath: string | null;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

type Aspect = "square" | "portrait";

const ASPECT_CONFIG: Record<Aspect, { ratio: number; maxOutput: number; label: string }> = {
  square: { ratio: 1, maxOutput: 1200, label: "Quadrada (1200×1200)" },
  portrait: { ratio: 1080 / 1620, maxOutput: 1080, label: "Retrato (1080×1620)" },
};

export function AnnouncementForm({ initialActive, initialImagePath, onSubmit }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(initialActive);
  const [aspect, setAspect] = useState<Aspect>("portrait");
  const cfg = ASPECT_CONFIG[aspect];

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
            Quando ligado, o modal aparece <strong>logo após a animação de intro</strong> na home do restaurante
            ativo. Cliente fecha clicando no X, fora do modal ou apertando ESC — não aparece de novo na mesma
            sessão.
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="announcement_aspect" className="admin-label">
          Formato da imagem
        </label>
        <select
          id="announcement_aspect"
          value={aspect}
          onChange={(e) => setAspect(e.target.value as Aspect)}
          className="admin-input max-w-sm"
        >
          <option value="portrait">Retrato (1080×1620) — recomendado pra mobile</option>
          <option value="square">Quadrada (1200×1200)</option>
        </select>
        <p className="text-xs text-ink-muted">
          Escolha antes de subir a imagem. O crop ajusta pro formato escolhido.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="admin-label">Imagem do aviso</span>
        <ImageUpload
          key={aspect}
          name="announcement_image"
          initialPath={initialImagePath}
          aspect={cfg.ratio}
          maxOutputSize={cfg.maxOutput}
        />
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
