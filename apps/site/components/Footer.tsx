import { fs } from "@/lib/scale";

type Props = {
  left: string;
  right: string;
};

export function Footer({ left, right }: Props) {
  if (!left && !right) return null;
  return (
    <footer
      className="flex items-center justify-between"
      style={{
        padding: "20px 22px",
        borderTop: "0.5px solid var(--ink-ghost)",
        fontSize: fs(10),
        fontWeight: 400,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--ink-soft)",
        opacity: 0.85,
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </footer>
  );
}
