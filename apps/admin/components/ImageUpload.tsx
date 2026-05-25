"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Trash, UploadSimple, Crop } from "@phosphor-icons/react";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/storage";
import { ImageCropDialog } from "./ImageCropDialog";

type Props = {
  name: string;
  initialPath: string | null;
};

export function ImageUpload({ name, initialPath }: Props) {
  const [preview, setPreview] = useState<string | null>(publicImageUrl(initialPath));
  const [shouldRemove, setShouldRemove] = useState(false);
  // URL temporário do arquivo recém-escolhido, usado pelo dialog de crop
  const [cropSource, setCropSource] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // limpa URLs criadas pra evitar leak
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      if (cropSource?.startsWith("blob:")) URL.revokeObjectURL(cropSource);
    };
    // intencional: só cleanup no unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem maior que 8MB (max bruto).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    // abre dialog de crop em vez de aceitar direto
    const url = URL.createObjectURL(file);
    setCropSource(url);
  }

  function onCropConfirm(croppedFile: File) {
    if (!fileRef.current) return;

    // Substitui o valor do input file pra que o form leve o arquivo cortado
    const dt = new DataTransfer();
    dt.items.add(croppedFile);
    fileRef.current.files = dt.files;

    // Preview
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(croppedFile);
    setPreview(url);
    setShouldRemove(false);

    if (cropSource?.startsWith("blob:")) URL.revokeObjectURL(cropSource);
    setCropSource(null);

    toast.success("Foto pronta. Salve o item pra confirmar.");
  }

  function onCropCancel() {
    if (cropSource?.startsWith("blob:")) URL.revokeObjectURL(cropSource);
    setCropSource(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openCropAgain() {
    // re-abre o dialog usando o preview atual (que é um blob: do crop anterior)
    if (preview) setCropSource(preview);
  }

  function onRemove() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setShouldRemove(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-ghost bg-bg-muted">
          {preview ? (
            <Image
              src={preview}
              alt=""
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon size={32} className="text-ink-faint" weight="duotone" />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="admin-btn-secondary cursor-pointer">
            <UploadSimple size={18} />
            Escolher imagem
            <input
              ref={fileRef}
              type="file"
              name={name}
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={onFile}
              className="sr-only"
            />
          </label>
          <p className="text-xs text-ink-muted">JPEG, PNG, WebP ou AVIF · máx. 8MB (cortado pra 1200×1200)</p>
          {preview ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={openCropAgain} className="admin-btn-secondary w-fit">
                <Crop size={16} />
                Reajustar
              </button>
              <button type="button" onClick={onRemove} className="admin-btn-danger w-fit">
                <Trash size={16} />
                Remover foto
              </button>
            </div>
          ) : null}
          <input type="hidden" name={`${name}__remove`} value={shouldRemove ? "true" : "false"} readOnly />
        </div>
      </div>

      <ImageCropDialog
        open={cropSource !== null}
        sourceUrl={cropSource}
        aspect={1}
        maxOutputSize={1200}
        outputType="image/jpeg"
        onClose={onCropCancel}
        onConfirm={onCropConfirm}
      />
    </>
  );
}
