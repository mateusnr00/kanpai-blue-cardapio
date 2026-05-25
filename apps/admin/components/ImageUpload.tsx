"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Image as ImageIcon, Trash, UploadSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/storage";

type Props = {
  name: string;
  initialPath: string | null;
};

export function ImageUpload({ name, initialPath }: Props) {
  const [preview, setPreview] = useState<string | null>(publicImageUrl(initialPath));
  const [shouldRemove, setShouldRemove] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
    setShouldRemove(false);
  }

  function onRemove() {
    setPreview(null);
    setShouldRemove(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-ghost bg-bg-muted">
        {preview ? (
          <Image src={preview} alt="" width={112} height={112} unoptimized className="h-full w-full object-cover" />
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
        <p className="text-xs text-ink-muted">JPEG, PNG, WebP ou AVIF · máx. 5MB</p>
        {preview ? (
          <button type="button" onClick={onRemove} className="admin-btn-danger w-fit">
            <Trash size={16} />
            Remover foto
          </button>
        ) : null}
        <input type="hidden" name={`${name}__remove`} value={shouldRemove ? "true" : "false"} readOnly />
      </div>
    </div>
  );
}
