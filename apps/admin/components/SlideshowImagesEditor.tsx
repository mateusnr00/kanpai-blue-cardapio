"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UploadSimple, Trash, Image as ImageIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/storage";

type Slot =
  | { kind: "existing"; path: string; previewUrl: string }
  | { kind: "new"; file: File; previewUrl: string };

type Props = {
  /** Caminhos atuais (DB). */
  initial: string[];
};

const MAX_FILES = 12;
const MAX_SIZE_MB = 5;
const MAX_INPUT_DIMENSION = 2200;
const MAX_OUTPUT_SIZE = 1400;
const OUTPUT_QUALITY = 0.86;
const OUTPUT_MIME = "image/webp";

async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function optimizeForSlideshow(file: File): Promise<File> {
  // Se ja vier em tamanho e formato ideais, evita recompressao desnecessaria.
  const isWebp = file.type === OUTPUT_MIME;
  const img = await loadImageFromBlob(file);
  const longest = Math.max(img.width, img.height);
  if (isWebp && longest <= MAX_OUTPUT_SIZE) return file;

  const inputRatio = Math.min(1, MAX_INPUT_DIMENSION / longest);
  const inputW = Math.round(img.width * inputRatio);
  const inputH = Math.round(img.height * inputRatio);
  const inputCanvas = document.createElement("canvas");
  inputCanvas.width = inputW;
  inputCanvas.height = inputH;
  const inputCtx = inputCanvas.getContext("2d");
  if (!inputCtx) throw new Error("Falha ao preparar canvas");
  inputCtx.drawImage(img, 0, 0, inputW, inputH);

  const outputRatio = Math.min(1, MAX_OUTPUT_SIZE / Math.max(inputW, inputH));
  const outW = Math.round(inputW * outputRatio);
  const outH = Math.round(inputH * outputRatio);
  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Falha ao preparar canvas");
  outCtx.drawImage(inputCanvas, 0, 0, outW, outH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    outCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao exportar imagem"))),
      OUTPUT_MIME,
      OUTPUT_QUALITY,
    );
  });

  const baseName = file.name.replace(/\.[a-z0-9]+$/i, "") || "slideshow";
  return new File([blob], `${baseName}.webp`, { type: OUTPUT_MIME });
}

/**
 * Editor multi-upload pra slideshow_image_paths da categoria.
 *
 * Como a action de salvar nao consegue preservar tipos mistos (existentes vs
 * novos) num unico array, usamos uma convencao via campos do form:
 *   - slideshow_count: int (numero total de slots)
 *   - slideshow_<i>_path: string (caminho existente, vazio se for upload novo)
 *   - slideshow_<i>_file: File (apenas pros slots novos)
 *
 * A action processa em ordem: se path != "", reusa; senao, faz upload do file
 * e usa o path retornado.
 */
export function SlideshowImagesEditor({ initial }: Props) {
  const [slots, setSlots] = useState<Slot[]>(() => {
    const out: Slot[] = [];
    for (const p of initial) {
      const url = publicImageUrl(p);
      if (url) out.push({ kind: "existing", path: p, previewUrl: url });
    }
    return out;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const slotsRef = useRef<Slot[]>(slots);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    return () => {
      for (const slot of slotsRef.current) {
        if (slot.kind === "new") URL.revokeObjectURL(slot.previewUrl);
      }
    };
  }, []);

  async function onAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsProcessing(true);
    const next: Slot[] = [];
    try {
      for (const f of files) {
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${f.name}: maior que ${MAX_SIZE_MB}MB`);
          continue;
        }
        const optimized = await optimizeForSlideshow(f);
        next.push({ kind: "new", file: optimized, previewUrl: URL.createObjectURL(optimized) });
      }
    } catch (err) {
      console.error("[SlideshowImagesEditor] optimize falhou:", err);
      toast.error("Nao foi possivel processar uma ou mais fotos.");
    } finally {
      setIsProcessing(false);
    }

    setSlots((prev) => {
      const merged = [...prev, ...next];
      if (merged.length > MAX_FILES) {
        toast.error(`Máximo de ${MAX_FILES} fotos no slideshow.`);
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAt(idx: number) {
    setSlots((prev) => {
      const target = prev[idx];
      if (target?.kind === "new") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function move(idx: number, dir: -1 | 1) {
    setSlots((prev) => {
      const next = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="slideshow_count" value={slots.length} readOnly />

      {slots.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-faint bg-bg-muted/30 p-6 text-center text-sm text-ink-muted">
          Sem fotos ainda. Adicione 3 a 8 fotos pra o slideshow rotacionar no card da home.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {slots.map((s, i) => (
            <li
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-ink-faint bg-bg-muted"
            >
              {/* Hidden inputs pro action ler */}
              <input
                type="hidden"
                name={`slideshow_${i}_path`}
                value={s.kind === "existing" ? s.path : ""}
                readOnly
              />
              {s.kind === "new" ? (
                <input
                  type="file"
                  name={`slideshow_${i}_file`}
                  ref={(el) => {
                    // Browser FileList nao da pra setar via JS. Truque: usar
                    // DataTransfer pra colocar o file de volta no input.
                    if (el && s.kind === "new") {
                      const dt = new DataTransfer();
                      dt.items.add(s.file);
                      el.files = dt.files;
                    }
                  }}
                  className="hidden"
                  readOnly
                />
              ) : null}

              <Image
                src={s.previewUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                unoptimized={s.kind === "new"}
                className="object-cover"
              />

              {/* Overlay com acoes */}
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-transparent via-transparent to-black/60 p-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex items-center justify-between gap-1">
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-ink">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger hover:bg-white"
                    aria-label="Remover"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-ink hover:bg-white disabled:opacity-30"
                    aria-label="Mover pra esquerda"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === slots.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-ink hover:bg-white disabled:opacity-30"
                    aria-label="Mover pra direita"
                  >
                    →
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="admin-btn-secondary cursor-pointer">
          <UploadSimple size={18} />
          {isProcessing ? "Processando..." : "Adicionar fotos"}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onAddFiles}
            disabled={isProcessing}
            className="sr-only"
          />
        </label>
        <p className="text-xs text-ink-muted">
          <ImageIcon size={14} className="inline-block align-text-bottom" weight="duotone" /> JPEG, PNG, WebP ou AVIF · máx. {MAX_SIZE_MB}MB por foto · até {MAX_FILES} fotos · exporta em WebP até {MAX_OUTPUT_SIZE}px
        </p>
      </div>
    </div>
  );
}
