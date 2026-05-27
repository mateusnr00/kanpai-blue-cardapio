"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowSquareOut, ArrowLeft } from "@phosphor-icons/react";
import { saveTheme } from "./actions";
import type { LinktreeThemeRow } from "@/lib/data/linktree-theme";

type Props = {
  initial: LinktreeThemeRow;
  siteUrl: string;
};

const FONTS = ["Inter", "DM Sans", "Poppins", "Montserrat", "Playfair Display", "system-ui"];

export function DesignForm({ initial, siteUrl }: Props) {
  const [pending, startTransition] = useTransition();

  // estado controlado pros campos que precisam de UI sincronizada (color picker + hex)
  const [bgKind, setBgKind] = useState(initial.bg_kind);
  const [bgColor, setBgColor] = useState(initial.bg_color);
  const [bgGradFrom, setBgGradFrom] = useState(initial.bg_gradient_from);
  const [bgGradTo, setBgGradTo] = useState(initial.bg_gradient_to);
  const [textColor, setTextColor] = useState(initial.text_color);
  const [subtitleColor, setSubtitleColor] = useState(initial.subtitle_color);
  const [buttonStyle, setButtonStyle] = useState(initial.button_style);
  const [btnBorderColor, setBtnBorderColor] = useState(initial.button_border_color);
  const [btnBgColor, setBtnBgColor] = useState(initial.button_bg_color);
  const [btnTextColor, setBtnTextColor] = useState(initial.button_text_color);
  const [btnRadius, setBtnRadius] = useState(initial.button_radius);
  const [btnShadow, setBtnShadow] = useState(initial.button_shadow);
  const [fontFamily, setFontFamily] = useState(initial.font_family);

  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logo_url);

  // Background image state
  const [bgUrl, setBgUrl] = useState<string | null>(initial.bg_image_url);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(initial.bg_image_url);

  function onLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setLogoFile(f);
    setLogoPreview(f ? URL.createObjectURL(f) : logoUrl);
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoUrl(null);
    setLogoPreview(null);
  }

  function onBgChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setBgFile(f);
    setBgPreview(f ? URL.createObjectURL(f) : bgUrl);
  }

  function removeBg() {
    setBgFile(null);
    setBgUrl(null);
    setBgPreview(null);
  }

  async function onSubmit(formData: FormData) {
    if (logoFile) formData.set("logo_file", logoFile);
    formData.set("logo_remove", logoUrl === null && !logoFile ? "true" : "false");
    if (bgFile) formData.set("bg_image_file", bgFile);
    formData.set("bg_image_remove", bgUrl === null && !bgFile ? "true" : "false");

    startTransition(async () => {
      const res = await saveTheme(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Design salvo. Atualize o preview pra ver.");
      }
    });
  }

  const [previewKey, setPreviewKey] = useState(0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form action={onSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Link
            href="/linktree"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-ghost px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-bg-surface"
          >
            <ArrowLeft size={12} weight="bold" />
            Botões
          </Link>
        </div>

        {/* Perfil */}
        <Section title="Perfil">
          <Field label="Título">
            <input name="title" defaultValue={initial.title} required className="admin-input" />
          </Field>
          <Field label="Subtítulo">
            <input name="subtitle" defaultValue={initial.subtitle} className="admin-input" />
          </Field>
          <Field label="Rodapé">
            <input name="footer" defaultValue={initial.footer} className="admin-input" />
          </Field>
          <Field label="Logo">
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  alt=""
                  src={logoPreview}
                  className="h-16 w-16 rounded-xl object-contain ring-1 ring-ink-ghost"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-bg-surface text-xs text-ink-soft ring-1 ring-ink-ghost">
                  sem logo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer rounded-lg border border-ink-ghost px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-bg-surface">
                  Escolher
                  <input type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
                </label>
                {logoPreview ? (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="rounded-lg border border-ink-ghost px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-bg-surface"
                  >
                    Remover
                  </button>
                ) : null}
              </div>
            </div>
          </Field>
        </Section>

        {/* Cores e Fundo */}
        <Section title="Fundo">
          <Field label="Tipo">
            <div className="flex flex-wrap gap-2">
              <KindButton current={bgKind} value="solid" onSelect={setBgKind}>
                Sólido
              </KindButton>
              <KindButton current={bgKind} value="gradient" onSelect={setBgKind}>
                Gradiente
              </KindButton>
              <KindButton current={bgKind} value="image" onSelect={setBgKind}>
                Imagem
              </KindButton>
              <input type="hidden" name="bg_kind" value={bgKind} />
            </div>
          </Field>

          {bgKind === "solid" ? (
            <Field label="Cor de fundo">
              <ColorInput name="bg_color" value={bgColor} onChange={setBgColor} />
            </Field>
          ) : null}

          {bgKind === "gradient" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gradiente (início)">
                <ColorInput name="bg_gradient_from" value={bgGradFrom} onChange={setBgGradFrom} />
              </Field>
              <Field label="Gradiente (fim)">
                <ColorInput name="bg_gradient_to" value={bgGradTo} onChange={setBgGradTo} />
              </Field>
            </div>
          ) : null}

          {bgKind === "image" ? (
            <Field label="Imagem de fundo">
              <div className="flex items-center gap-4">
                {bgPreview ? (
                  <img
                    alt=""
                    src={bgPreview}
                    className="h-24 w-24 rounded-xl object-cover ring-1 ring-ink-ghost"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-bg-surface text-xs text-ink-soft ring-1 ring-ink-ghost">
                    sem imagem
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer rounded-lg border border-ink-ghost px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-bg-surface">
                    Escolher
                    <input type="file" accept="image/*" onChange={onBgChange} className="hidden" />
                  </label>
                  {bgPreview ? (
                    <button
                      type="button"
                      onClick={removeBg}
                      className="rounded-lg border border-ink-ghost px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-bg-surface"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-ink-soft">
                A imagem cobre o fundo todo (cover, centralizada). Use uma foto vertical pra mobile.
              </p>
            </Field>
          ) : null}

          {/* Sempre mantemos os campos no form (mesmo escondidos) pra nao perder valor */}
          {bgKind !== "solid" ? (
            <input type="hidden" name="bg_color" value={bgColor} />
          ) : null}
          {bgKind !== "gradient" ? (
            <>
              <input type="hidden" name="bg_gradient_from" value={bgGradFrom} />
              <input type="hidden" name="bg_gradient_to" value={bgGradTo} />
            </>
          ) : null}
        </Section>

        <Section title="Cores do texto">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título">
              <ColorInput name="text_color" value={textColor} onChange={setTextColor} />
            </Field>
            <Field label="Subtítulo / rodapé">
              <ColorInput name="subtitle_color" value={subtitleColor} onChange={setSubtitleColor} />
            </Field>
          </div>
        </Section>

        {/* Botões */}
        <Section title="Botões">
          <Field label="Estilo">
            <div className="flex gap-2">
              <KindButton current={buttonStyle} value="outline" onSelect={setButtonStyle}>
                Contorno
              </KindButton>
              <KindButton current={buttonStyle} value="filled" onSelect={setButtonStyle}>
                Preenchido
              </KindButton>
              <input type="hidden" name="button_style" value={buttonStyle} />
            </div>
          </Field>

          {buttonStyle === "outline" ? (
            <Field label="Cor da borda">
              <ColorInput
                name="button_border_color"
                value={btnBorderColor}
                onChange={setBtnBorderColor}
              />
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cor do botão">
                <ColorInput name="button_bg_color" value={btnBgColor} onChange={setBtnBgColor} />
              </Field>
              <Field label="Cor do texto">
                <ColorInput
                  name="button_text_color"
                  value={btnTextColor}
                  onChange={setBtnTextColor}
                />
              </Field>
            </div>
          )}

          {/* mantém os hidden pra não perder os outros valores ao trocar de estilo */}
          {buttonStyle !== "outline" ? (
            <input type="hidden" name="button_border_color" value={btnBorderColor} />
          ) : null}
          {buttonStyle !== "filled" ? (
            <>
              <input type="hidden" name="button_bg_color" value={btnBgColor} />
              <input type="hidden" name="button_text_color" value={btnTextColor} />
            </>
          ) : null}

          <Field label={`Arredondamento: ${btnRadius}px`}>
            <input
              name="button_radius"
              type="range"
              min={0}
              max={40}
              value={btnRadius >= 40 ? 40 : btnRadius}
              onChange={(e) => setBtnRadius(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBtnRadius(999)}
                className={`rounded-md border px-2 py-1 text-[11px] font-medium ${btnRadius >= 999 ? "border-ink bg-ink text-white" : "border-ink-ghost text-ink-muted hover:bg-bg-surface"}`}
              >
                Pílula
              </button>
              <button
                type="button"
                onClick={() => setBtnRadius(0)}
                className={`rounded-md border px-2 py-1 text-[11px] font-medium ${btnRadius === 0 ? "border-ink bg-ink text-white" : "border-ink-ghost text-ink-muted hover:bg-bg-surface"}`}
              >
                Reto
              </button>
            </div>
            {/* hidden override pro form se o slider nao bate (pill) */}
            {btnRadius >= 999 ? <input type="hidden" name="button_radius" value={999} /> : null}
          </Field>

          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input
              type="checkbox"
              name="button_shadow"
              checked={btnShadow}
              onChange={(e) => setBtnShadow(e.target.checked)}
            />
            Sombra nos botões
          </label>
        </Section>

        {/* Tipografia */}
        <Section title="Tipografia">
          <Field label="Fonte">
            <select
              name="font_family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="admin-input"
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-[11px] text-ink-soft">
            Inter é a padrão do site (já carregada). As outras vêm do Google Fonts e carregam só
            quando você seleciona.
          </p>
        </Section>

        <div className="sticky bottom-4 z-10">
          <button
            type="submit"
            disabled={pending}
            className="admin-btn-primary w-full py-3 text-base font-semibold shadow-lg"
          >
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>

      {/* Preview */}
      <aside className="hidden lg:block">
        <div className="sticky top-6">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              Preview ao vivo
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                title="Atualizar preview"
                className="rounded-md p-1.5 text-ink-muted hover:bg-bg-surface"
              >
                ↻
              </button>
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                title="Abrir site"
                className="rounded-md p-1.5 text-ink-muted hover:bg-bg-surface"
              >
                <ArrowSquareOut size={14} />
              </a>
            </div>
          </div>
          <div
            className="mx-auto overflow-hidden rounded-[36px] border-[8px] border-ink bg-black shadow-2xl"
            style={{ width: 320, height: 568 }}
          >
            <iframe
              key={previewKey}
              src={siteUrl}
              className="h-full w-full border-0"
              title="Preview"
            />
          </div>
          <p className="mx-auto mt-3 max-w-[280px] text-center text-[10px] leading-relaxed text-ink-soft">
            Salva primeiro, depois clica em <strong>↻</strong> pra ver as alterações.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-card flex flex-col gap-3 p-5">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}

function ColorInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border border-ink-ghost p-0.5"
      />
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input flex-1 font-mono text-sm"
      />
    </div>
  );
}

function KindButton<T extends string>({
  current,
  value,
  onSelect,
  children,
}: {
  current: T;
  value: T;
  onSelect: (v: T) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium ${
        active
          ? "border-ink bg-ink text-white"
          : "border-ink-ghost text-ink-secondary hover:bg-bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
