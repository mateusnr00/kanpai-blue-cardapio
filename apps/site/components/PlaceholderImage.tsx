import type { CSSProperties, ReactNode } from "react";

type Props = {
  gradient: string;
  number?: string;
  aspect?: "1/1" | "16/9" | "16/10" | "3/1" | "2/1";
  showCornerSquare?: boolean;
  /** Slot for badges (DESTAQUE / star). */
  topRight?: ReactNode;
  /** Force dark text if placeholder gradient is dark (e.g., blue Kanpai). */
  dark?: boolean;
  style?: CSSProperties;
};

export function PlaceholderImage({
  gradient,
  number: _number,
  aspect = "1/1",
  showCornerSquare = true,
  topRight,
  dark = false,
  style,
}: Props) {
  const borderColor = dark ? "rgba(250, 250, 248, 0.35)" : "var(--ink-faint)";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: aspect,
        background: gradient,
        ...style,
      }}
      aria-hidden
    >
      {showCornerSquare && !topRight && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            width: 5,
            height: 5,
            border: `0.5px solid ${borderColor}`,
            background: "transparent",
          }}
        />
      )}
      {topRight && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
          }}
        >
          {topRight}
        </div>
      )}
    </div>
  );
}
