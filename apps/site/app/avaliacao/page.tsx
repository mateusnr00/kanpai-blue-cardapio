import Image from "next/image";
import { listRestaurants } from "@/lib/menu-server";
import { fs } from "@/lib/scale";
import { ReviewForm } from "./ReviewForm";

export const metadata = {
  title: "Avalie-nos · Kanpai Blue",
  description: "Conte como foi sua experiência conosco.",
};

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";

type Props = {
  searchParams?: { restaurant?: string };
};

export default async function ReviewPage({ searchParams }: Props) {
  const restaurants = await listRestaurants();
  const list = restaurants.map((r) => ({ id: r.id, name: r.name }));
  const defaultId = searchParams?.restaurant && list.some((r) => r.id === searchParams.restaurant)
    ? searchParams.restaurant
    : undefined;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-warm)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 22px 64px",
        gap: 22,
      }}
    >
      <Image
        src={LOGO_URL}
        alt="Kanpai Blue"
        width={140}
        height={140}
        priority
        unoptimized
        style={{ width: 140, height: "auto", objectFit: "contain" }}
      />

      <header style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 style={{ margin: 0, fontSize: fs(24), fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)" }}>
          Avalie sua experiência
        </h1>
        <p style={{ margin: 0, fontSize: fs(13), color: "var(--ink-soft)" }}>
          Conte como foi sua visita ao Kanpai Blue.
        </p>
      </header>

      <div style={{ width: "100%", maxWidth: 480 }}>
        <ReviewForm restaurants={list} defaultRestaurantId={defaultId} />
      </div>
    </main>
  );
}
