import { fs } from "@/lib/scale";

export const metadata = {
  title: "Kanpai Blue · em breve",
  description: "Linktree em breve.",
};

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 22px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: fs(18),
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        linktree em breve
      </p>
    </main>
  );
}
