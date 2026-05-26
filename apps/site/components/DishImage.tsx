import Image from "next/image";
import type { ReactNode } from "react";
import { PlaceholderImage } from "./PlaceholderImage";

type Aspect = "1/1" | "16/9" | "16/10" | "3/1" | "2/1";

type Props = {
  /** URL pública da foto. Se ausente, cai pro PlaceholderImage. */
  src?: string;
  /** Alt acessível — sempre o nome do prato. */
  alt: string;
  /** Gradiente do placeholder de fallback. */
  gradient: string;
  /** Numero pequeno mostrado no canto do placeholder. */
  number?: string;
  aspect?: Aspect;
  /** Badge/overlay no canto superior direito (DESTAQUE etc). */
  topRight?: ReactNode;
  /** Se true, força texto claro no placeholder (gradient escuro). */
  dark?: boolean;
  /** Prioriza essa imagem no carregamento (above-the-fold / hero). */
  priority?: boolean;
};

const SIZES_BY_ASPECT: Record<Aspect, string> = {
  "1/1": "(max-width: 768px) 50vw, 280px",
  "16/9": "(max-width: 768px) 100vw, 600px",
  "16/10": "(max-width: 768px) 100vw, 600px",
  "3/1": "(max-width: 768px) 100vw, 900px",
  "2/1": "(max-width: 768px) 100vw, 900px",
};

// blur 1x1 cream (base64 webp ~70B). Mostra imediatamente enquanto a foto carrega.
const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAwAQCdASoEAAQAAUAmJaQAA3AA/v3AgAA=";

export function DishImage({
  src,
  alt,
  gradient,
  number,
  aspect = "1/1",
  topRight,
  dark,
  priority,
}: Props) {
  if (!src) {
    return (
      <PlaceholderImage
        gradient={gradient}
        number={number}
        aspect={aspect}
        topRight={topRight}
        dark={dark}
      />
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: aspect,
        overflow: "hidden",
        background: gradient,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={SIZES_BY_ASPECT[aspect]}
        style={{ objectFit: "cover" }}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        quality={80}
      />
      {topRight ? (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>{topRight}</div>
      ) : null}
    </div>
  );
}
