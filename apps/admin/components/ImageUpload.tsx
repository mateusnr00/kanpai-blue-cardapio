"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Trash, UploadSimple, Crop } from "@phosphor-icons/react";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/storage";
import { ImageCropDialog } from "./ImageCropDialog";

type Props = {
  name: string;
  initialPath: string | null;
  /** Default: 1 (quadrado). Featured/full-width usa 16/9. */
  aspect?: number;
  /** Default: 1200 (lado maior). Featured pode usar 1920. */
  maxOutputSize?: number;
};

const MAX_INPUT_DIMENSION = 2000;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;

/**
 * Downscale grande pra acelerar o cropper. Retorna blob URL (mesma origem do app,
 * canvas nao fica tainted) + dimensoes finais. Pula se ja for pequeno.
 */
async function prepareSourceForCropper(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  // Tenta carregar pra checar dimensoes; se nao precisa downscale, devolve url cru.
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(e);
    el.src = url;
  });

  const longest = Math.max(img.width, img.height);
  if (longest <= MAX_INPUT_DIMENSION) return url;

  const ratio = MAX_INPUT_DIMENSION / longest;
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("downscale falhou"))), "image/jpeg", 0.92),
  );
  URL.revokeObjectURL(url);
  return URL.createObjectURL(blob);
}

/**
 * Para "Reajustar" sobre uma foto ja salva no Supabase: baixa como blob primeiro
 * pra evitar canvas tainted por CORS, mesmo com bucket publico.
 */
async function fetchAsBlobUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors", cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function ImageUpload({ name, initialPath, aspect = 1, maxOutputSize = 1200 }: Props) {
  // Preview: blob: ou https. shouldRemove indica que usuario clicou "Remover".
  const [preview, setPreview] = useState<string | null>(publicImageUrl(initialPath));
  const [shouldRemove, setShouldRemove] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string>("");

  // Input que serializa o file pro form (escondido, manipulado por DataTransfer).
  const submitInputRef = useRef<HTMLInputElement>(null);
  // Input que recebe o click do usuario (input file nativo).
  const pickerInputRef = useRef<HTMLInputElement>(null);

  function revokeIfBlob(url: string | null) {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  // cleanup geral no unmount
  useEffect(() => {
    return () => {
      revokeIfBlob(preview);
      revokeIfBlob(cropSource);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // limpa o picker pra permitir escolher o mesmo arquivo de novo
    if (pickerInputRef.current) pickerInputRef.current.value = "";
    if (!file) return;
    if (file.size > MAX_INPUT_BYTES) {
      toast.error("Imagem maior que 8MB (max bruto).");
      return;
    }
    setPreparing(true);
    try {
      const sourceUrl = await prepareSourceForCropper(file);
      // se ja havia um cropSource em uso (caso raro), revoke
      revokeIfBlob(cropSource);
      setCropSource(sourceUrl);
    } catch (err) {
      console.error("[ImageUpload] prepare falhou:", err);
      toast.error("Nao foi possivel ler a imagem.");
    } finally {
      setPreparing(false);
    }
  }

  function onCropConfirm(croppedFile: File, blurDataURL: string) {
    if (submitInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(croppedFile);
      submitInputRef.current.files = dt.files;
    }
    setBlurDataUrl(blurDataURL);
    const url = URL.createObjectURL(croppedFile);
    revokeIfBlob(preview);
    setPreview(url);
    setShouldRemove(false);
    revokeIfBlob(cropSource);
    setCropSource(null);
    toast.success("Foto pronta. Salve o item pra confirmar.");
  }

  function onCropCancel() {
    revokeIfBlob(cropSource);
    setCropSource(null);
    // nao mexe no preview nem no submitInput — mantem o que ja estava
  }

  async function openCropAgain() {
    if (!preview) return;
    setPreparing(true);
    try {
      const sourceUrl = preview.startsWith("blob:") ? preview : await fetchAsBlobUrl(preview);
      // se for o mesmo blob do preview, nao revoga (vamos reusar)
      setCropSource(sourceUrl);
    } catch (err) {
      console.error("[ImageUpload] reajustar falhou:", err);
      toast.error("Nao foi possivel abrir a foto pra reajustar.");
    } finally {
      setPreparing(false);
    }
  }

  function onRemove() {
    revokeIfBlob(preview);
    setPreview(null);
    setShouldRemove(true);
    if (submitInputRef.current) submitInputRef.current.value = "";
  }

  const cropLabel = aspect === 1
    ? `${maxOutputSize}×${maxOutputSize}`
    : `${maxOutputSize}×${Math.round(maxOutputSize / aspect)} (16:9)`;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div
          className="flex w-full items-center justify-center overflow-hidden rounded-xl border border-ink-ghost bg-bg-muted"
          style={{ aspectRatio: String(aspect) }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={32} className="text-ink-faint" weight="duotone" />
          )}
        </div>

        <label className="admin-btn-secondary w-full cursor-pointer justify-center">
          <UploadSimple size={16} />
          {preparing ? "Carregando..." : preview ? "Trocar imagem" : "Escolher imagem"}
          <input
            ref={pickerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPick}
            disabled={preparing}
            className="sr-only"
          />
        </label>
        <input ref={submitInputRef} type="file" name={name} className="sr-only" tabIndex={-1} />

        {preview ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={openCropAgain}
              disabled={preparing}
              className="admin-btn-secondary justify-center disabled:opacity-50"
            >
              <Crop size={14} />
              Reajustar
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={preparing}
              className="admin-btn-danger justify-center disabled:opacity-50"
            >
              <Trash size={14} />
              Remover
            </button>
          </div>
        ) : null}

        <p className="text-[11px] leading-snug text-ink-muted">
          JPEG, PNG, WebP ou AVIF, max. 8MB, cortado pra {cropLabel}
        </p>
        <input type="hidden" name={`${name}__remove`} value={shouldRemove ? "true" : "false"} readOnly />
        <input type="hidden" name={`${name}__blur`} value={blurDataUrl} readOnly />
      </div>

      <ImageCropDialog
        open={cropSource !== null}
        sourceUrl={cropSource}
        aspect={aspect}
        maxOutputSize={maxOutputSize}
        outputType="image/webp"
        onClose={onCropCancel}
        onConfirm={onCropConfirm}
      />
    </>
  );
}
