import Image from "next/image";
import { fs } from "@/lib/scale";
import { getRootButtons } from "@/lib/linktree-server";
import { LinktreePills } from "@/components/LinktreePills";

export const metadata = {
  title: "Kanpai Blue",
  description: "Cardápio digital, reservas e contato — Kanpai Blue Goiânia.",
};

export const revalidate = 86400;

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

export default async function HomePage() {
  const buttons = await getRootButtons();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-warm)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 22px 64px",
        gap: 28,
      }}
    >
      <Image
        src={LOGO_URL}
        alt="Kanpai Blue"
        width={220}
        height={220}
        priority
        unoptimized
        style={{ width: 220, height: "auto", objectFit: "contain" }}
      />

      <header style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
        <h1
          style={{
            margin: 0,
            fontSize: fs(28),
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          Kanpai Blue
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: fs(13),
            fontWeight: 400,
            color: "var(--ink-soft)",
            letterSpacing: "-0.005em",
          }}
        >
          Culinária japonesa contemporânea · Goiânia
        </p>
      </header>

      <LinktreePills buttons={buttons} />

      <footer
        style={{
          marginTop: "auto",
          paddingTop: 24,
          fontSize: fs(10),
          color: "var(--ink-soft)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        © Kanpai Blue
      </footer>
    </main>
  );
}
