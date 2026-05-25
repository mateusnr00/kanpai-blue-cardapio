import Link from "next/link";
import Image from "next/image";
import { listRestaurants } from "@/lib/menu-server";
import { restaurant as info } from "@/lib/menu-data";
import { fs } from "@/lib/scale";

export const revalidate = 60;

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

export const metadata = {
  title: "Kanpai Blue · Goiânia",
  description: `Cardápios digitais das unidades do Kanpai Blue em Goiânia.`,
};

export default async function LinktreePage() {
  const restaurants = await listRestaurants().catch(() => []);

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
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <Image
          src={LOGO_URL}
          alt="Kanpai Blue"
          width={1280}
          height={352}
          priority
          sizes="180px"
          style={{ height: 40, width: "auto" }}
        />

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: fs(28),
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            Escolha a unidade
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: fs(13),
              color: "var(--ink-soft)",
              lineHeight: 1.5,
            }}
          >
            Cardápios digitais em Goiânia · {info.hours.main}
          </p>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
          }}
        >
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/${r.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-card)",
                border: "0.5px solid var(--ink-faint)",
                borderRadius: 18,
                padding: "20px 22px",
                color: "var(--ink)",
                transition: "border-color 150ms ease",
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: fs(17), fontWeight: 500, letterSpacing: "-0.01em" }}>
                  {r.shortName}
                </span>
                <span style={{ fontSize: fs(11), color: "var(--ink-soft)" }}>
                  {r.name}
                </span>
              </span>
              <span aria-hidden style={{ fontSize: fs(14), color: "var(--ink-soft)" }}>→</span>
            </Link>
          ))}

          {restaurants.length === 0 ? (
            <p style={{ fontSize: fs(12), color: "var(--ink-soft)", textAlign: "center" }}>
              Carregando unidades...
            </p>
          ) : null}
        </nav>

        <footer style={{ marginTop: 24, textAlign: "center", fontSize: fs(10), color: "var(--ink-soft)" }}>
          <p style={{ margin: 0 }}>{info.address}</p>
          <p style={{ margin: "4px 0 0" }}>{info.phone} · {info.instagram}</p>
        </footer>
      </div>
    </main>
  );
}
