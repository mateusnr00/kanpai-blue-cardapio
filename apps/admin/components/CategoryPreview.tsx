import Image from "next/image";
import { publicImageUrl } from "@/lib/storage";

type Props = {
  gradient: string;
  label: string;
  imagePath?: string | null;
};

export function CategoryPreview({ gradient, label, imagePath }: Props) {
  const url = publicImageUrl(imagePath ?? null);

  if (url) {
    return (
      <span className="relative inline-flex h-8 w-20 overflow-hidden rounded-md shadow-sm">
        <Image src={url} alt="" fill sizes="80px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className="inline-flex h-8 w-20 items-center justify-center rounded-md text-[10px] font-medium uppercase tracking-wide text-white shadow-sm"
      style={{ background: gradient }}
    >
      {label.slice(0, 5)}
    </span>
  );
}
