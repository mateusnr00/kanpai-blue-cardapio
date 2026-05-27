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
  /** LQIP base64 vindo do banco (gerado no admin no upload). */
  blurDataUrl?: string;
};

const SIZES_BY_ASPECT: Record<Aspect, string> = {
  "1/1": "(max-width: 768px) 50vw, 280px",
  "16/9": "(max-width: 768px) 100vw, 600px",
  "16/10": "(max-width: 768px) 100vw, 600px",
  "3/1": "(max-width: 768px) 100vw, 900px",
  "2/1": "(max-width: 768px) 100vw, 900px",
};

const SUPABASE_HOST = "rxzohyrttklxevegdijm.supabase.co";

/**
 * Fotos de prato/categoria ja vivem no Supabase em WebP q=90 max 1200px (~50-150KB).
 * Servir direto evita o cold-cache penalty do Next/Image optimizer (~1-2s na 1a visita).
 * Logos/banners externos continuam via Next/Image.
 */
function isAlreadyOptimized(src: string): boolean {
  return src.includes(SUPABASE_HOST) && src.includes("/dish-images/");
}

export function DishImage({
  src,
  alt,
  gradient,
  number,
  aspect = "1/1",
  topRight,
  dark,
  priority,
  blurDataUrl,
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

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: aspect,
    overflow: "hidden",
    background: gradient,
  };

  // Caminho rapido: foto ja otimizada vai direto do Supabase CDN, sem Next/Image
  if (isAlreadyOptimized(src)) {
    return (
      <div
        style={{
          ...wrapperStyle,
          // LQIP blur como background — aparece instantaneo, e coberto pela <img> ao carregar
          ...(blurDataUrl
            ? {
                backgroundImage: `url("${blurDataUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" } : {})}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {topRight ? (
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>{topRight}</div>
        ) : null}
      </div>
    );
  }

  // URL externa nao conhecida: passa pelo Next/Image normal
  return (
    <div style={wrapperStyle}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={SIZES_BY_ASPECT[aspect]}
        style={{ objectFit: "cover" }}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={80}
        {...(blurDataUrl
          ? { placeholder: "blur" as const, blurDataURL: blurDataUrl }
          : {})}
      />
      {topRight ? (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}>{topRight}</div>
      ) : null}
    </div>
  );
}
