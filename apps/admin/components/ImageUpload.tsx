"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/storage";

type Props = {
  name: string;        // FormData name
  initialPath: string | null;
};

export function ImageUpload({ name, initialPath }: Props) {
  const [path, setPath] = useState<string | null>(initialPath);
  const [preview, setPreview] = useState<string | null>(publicImageUrl(initialPath));
  const fileRef = useRef<HTMLInputElement>(null);
  const removeRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (removeRef.current) removeRef.current.value = "false";
  }

  function onRemove() {
    setPreview(null);
    setPath(null);
    if (fileRef.current) fileRef.current.value = "";
    if (removeRef.current) removeRef.current.value = "true";
  }

  return (
    <div className="flex items-start gap-4">
      <div className="h-24 w-24 overflow-hidden rounded-md border border-ink-faint bg-bg-card">
        {preview ? (
          <Image
            src={preview}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="h-24 w-24 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
            sem foto
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onFile}
          className="text-xs"
        />
        {preview ? (
          <button
            type="button"
            onClick={onRemove}
            className="self-start text-xs font-medium text-red-700 hover:opacity-80"
          >
            Remover foto
          </button>
        ) : null}
        <input ref={removeRef} type="hidden" name={`${name}__remove`} defaultValue="false" />
        <input type="hidden" name={`${name}__current`} defaultValue={path ?? ""} />
      </div>
    </div>
  );
}
