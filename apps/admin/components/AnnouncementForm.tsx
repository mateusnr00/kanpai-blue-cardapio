"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { describeSchedule } from "@/lib/announcement-schedule";
import { publicImageUrl } from "@/lib/storage";
import type { AnnouncementRow } from "@/lib/data/announcements";

type Aspect = "portrait" | "square";

const ASPECT_CONFIG: Record<Aspect, { ratio: number; maxOutput: number; label: string }> = {
  portrait: { ratio: 1080 / 1920, maxOutput: 1080, label: "Retrato 9:16 (1080×1920)" },
  square: { ratio: 1, maxOutput: 1200, label: "Quadrada (1200×1200)" },
};

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Props = {
  initial?: AnnouncementRow;
  /** Path do storage da imagem atual (derivado da image_url) — pro ImageUpload. */
  initialImagePath?: string | null;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
};

/** datetime-local exige "YYYY-MM-DDTHH:MM"; data-só vira T00:00. */
function toLocalInput(v: string | null | undefined): string {
  if (!v) return "";
  return v.length <= 10 ? `${v}T00:00` : v.slice(0, 16);
}

export function AnnouncementForm({ initial, initialImagePath, onSubmit }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [active, setActive] = useState(initial?.is_active ?? true);
  const [aspect, setAspect] = useState<Aspect>(initial?.aspect ?? "portrait");
  const [dim, setDim] = useState<number>(initial?.dim ?? 0);
  const [start, setStart] = useState(toLocalInput(initial?.schedule_start));
  const [end, setEnd] = useState(toLocalInput(initial?.schedule_end));
  const [daysOff, setDaysOff] = useState<number[]>(initial?.schedule_days_off ?? []);

  const cfg = ASPECT_CONFIG[aspect];
  const summary = describeSchedule({ start: start || null, end: end || null, daysOff });
  const previewUrl = publicImageUrl(initialImagePath ?? null);

  function toggleDay(d: number) {
    setDaysOff((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Aviso salvo");
      }
    });
  }

  return (
    <form action={action} className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ann_name" className="admin-label">Nome interno (só pra organizar)</label>
            <input
              id="ann_name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Natal 2026"
              className="admin-input max-w-sm"
            />
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="mt-1"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-ink">Mostrar no site</span>
              <span className="text-xs text-ink-muted">
                Quando ligado (e dentro da programação), o modal aparece após a intro, 1x por sessão.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ann_aspect" className="admin-label">Proporção da imagem</label>
            <select
              id="ann_aspect"
              value={aspect}
              onChange={(e) => setAspect(e.target.value as Aspect)}
              className="admin-input max-w-sm"
            >
              <option value="portrait">{ASPECT_CONFIG.portrait.label}</option>
              <option value="square">{ASPECT_CONFIG.square.label}</option>
            </select>
            <p className="text-xs text-ink-muted">Escolha antes de subir a imagem — o crop ajusta pro formato.</p>
          </div>

          <input type="hidden" name="aspect" value={aspect} />

          <div className="flex flex-col gap-2">
            <span className="admin-label">Imagem do aviso</span>
            <ImageUpload
              key={aspect}
              name="image"
              initialPath={initialImagePath ?? null}
              aspect={cfg.ratio}
              maxOutputSize={cfg.maxOutput}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ann_dim" className="admin-label">Escurecer fundo ({dim}%)</label>
            <input
              id="ann_dim"
              name="dim"
              type="range"
              min={0}
              max={90}
              step={5}
              value={dim}
              onChange={(e) => setDim(Number(e.target.value))}
              className="max-w-sm"
            />
            <p className="text-xs text-ink-muted">Escurece o fundo atrás do aviso (0 = só o blur padrão).</p>
          </div>

          {/* Programação */}
          <fieldset className="flex flex-col gap-3 rounded-md border border-ink-faint p-4">
            <legend className="px-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Programação</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ann_start" className="admin-label">Início (data e hora)</label>
                <input
                  id="ann_start"
                  name="schedule_start"
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="admin-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ann_end" className="admin-label">Fim (data e hora)</label>
                <input
                  id="ann_end"
                  name="schedule_end"
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="admin-label">Não aparece nestes dias</span>
              <div className="flex flex-wrap gap-1.5">
                {DAY_LABELS.map((lbl, d) => {
                  const on = daysOff.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={
                        "rounded-md px-3 py-1.5 text-xs font-medium transition " +
                        (on ? "bg-ink text-white" : "border border-ink-faint bg-bg-card text-ink hover:border-ink")
                      }
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
              {daysOff.map((d) => (
                <input key={d} type="hidden" name="days_off" value={d} />
              ))}
            </div>

            <p className="rounded-md bg-bg-muted px-3 py-2 text-xs text-ink-soft">{summary}</p>
          </fieldset>
        </div>

        {/* Preview ao vivo */}
        <aside className="flex flex-col gap-2 lg:sticky lg:top-20">
          <span className="admin-label">Pré-visualização</span>
          <div className="relative overflow-hidden rounded-xl bg-bg-muted ring-1 ring-ink-ghost" style={{ aspectRatio: "9 / 16" }}>
            {/* fundo escurecido */}
            <div
              className="absolute inset-0"
              style={{ background: `rgba(8, 4, 30, ${dim / 100})`, backdropFilter: "blur(2px)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="overflow-hidden rounded-lg bg-[#0a0418] shadow-lg ring-1 ring-white/10"
                style={{ aspectRatio: String(cfg.ratio), maxWidth: "100%", maxHeight: "100%", width: aspect === "square" ? "85%" : "70%" }}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-white/60">
                    Suba uma imagem
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-ink-muted">
            O escurecimento atualiza ao vivo. A imagem aqui é a já salva (a nova aparece após salvar).
          </p>
        </aside>
      </div>

      {error ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="admin-btn-primary">
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={() => router.push("/aviso")} className="admin-btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
