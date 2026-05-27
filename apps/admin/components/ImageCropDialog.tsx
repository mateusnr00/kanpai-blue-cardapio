"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ArrowClockwise, ArrowCounterClockwise, X } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  sourceUrl: string | null;
  aspect?: number;
  maxOutputSize?: number;
  outputType?: "image/jpeg" | "image/webp" | "image/png";
  onClose: () => void;
  onConfirm: (file: File, blurDataURL: string) => void;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

async function getCroppedFile(
  sourceUrl: string,
  pixelCrop: Area,
  rotation: number,
  maxOutputSize: number,
  outputType: string,
): Promise<{ file: File; blurDataURL: string }> {
  const image = await loadImage(sourceUrl);

  // Caminho rapido: sem rotacao, copia direto do <img> via crop area
  let cropSource: CanvasImageSource = image;
  let sourceX = pixelCrop.x;
  let sourceY = pixelCrop.y;

  if (rotation !== 0) {
    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const rotatedW = image.width * cos + image.height * sin;
    const rotatedH = image.width * sin + image.height * cos;

    const rotated = document.createElement("canvas");
    rotated.width = rotatedW;
    rotated.height = rotatedH;
    const rctx = rotated.getContext("2d")!;
    rctx.translate(rotatedW / 2, rotatedH / 2);
    rctx.rotate(radians);
    rctx.drawImage(image, -image.width / 2, -image.height / 2);
    cropSource = rotated;
  }

  const ratio = Math.min(1, maxOutputSize / Math.max(pixelCrop.width, pixelCrop.height));
  const outW = Math.round(pixelCrop.width * ratio);
  const outH = Math.round(pixelCrop.height * ratio);

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d")!;
  octx.drawImage(
    cropSource,
    sourceX,
    sourceY,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    out.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas vazio (provavel CORS/tainted)."))),
      outputType,
      0.88,
    ),
  );

  const ext = outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
  const file = new File([blob], `dish-image.${ext}`, { type: outputType });

  // Gera blur LQIP: 16px no lado maior, WebP q=0.4 (~200-300 bytes base64)
  const blurMax = 16;
  const blurRatio = blurMax / Math.max(outW, outH);
  const blurW = Math.max(1, Math.round(outW * blurRatio));
  const blurH = Math.max(1, Math.round(outH * blurRatio));
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = blurW;
  blurCanvas.height = blurH;
  const bctx = blurCanvas.getContext("2d")!;
  bctx.drawImage(out, 0, 0, blurW, blurH);
  const blurDataURL = blurCanvas.toDataURL("image/webp", 0.4);

  return { file, blurDataURL };
}

export function ImageCropDialog({
  open,
  sourceUrl,
  aspect = 1,
  maxOutputSize = 1200,
  outputType = "image/jpeg",
  onClose,
  onConfirm,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setPixelCrop(null);
      setError(null);
    }
  }, [open, sourceUrl]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixelCrop(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!sourceUrl || !pixelCrop) return;
    setProcessing(true);
    setError(null);
    try {
      const { file, blurDataURL } = await getCroppedFile(sourceUrl, pixelCrop, rotation, maxOutputSize, outputType);
      onConfirm(file, blurDataURL);
    } catch (err) {
      console.error("[ImageCropDialog] falhou:", err);
      setError((err as Error).message || "Falha ao processar a imagem.");
    } finally {
      setProcessing(false);
    }
  }

  if (!open || !sourceUrl) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 text-white">
        <p className="text-sm font-medium">Ajuste a foto</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Cancelar"
        >
          <X size={18} weight="bold" />
        </button>
      </header>

      <div className="relative flex-1 bg-black">
        <Cropper
          image={sourceUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
        />
      </div>

      {error ? (
        <div className="shrink-0 bg-red-600 px-4 py-2 text-center text-xs font-medium text-white">
          {error}
        </div>
      ) : null}

      <footer className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-black/95 px-4 py-4 text-white sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 text-xs">
          <span className="w-12 shrink-0 text-white/70">Zoom</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-white"
          />
          <span className="w-10 shrink-0 tabular-nums text-white/70">{zoom.toFixed(2)}x</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRotation((r) => r - 90)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Girar 90 anti-horario"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => r + 90)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Girar 90 horario"
          >
            <ArrowClockwise size={16} weight="bold" />
          </button>
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !pixelCrop}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
          >
            {processing ? "Processando..." : "Usar esta foto"}
          </button>
        </div>
      </footer>
    </div>
  );
}
