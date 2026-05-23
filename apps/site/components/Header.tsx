"use client";

import Link from "next/link";
import Image from "next/image";
import { FontSizeToggle } from "./FontSizeToggle";
import { SearchBar } from "./SearchBar";
import type { Category } from "@/lib/menu-types";

const LOGO_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/logo%20kanpai%20(1).png";
const SPONSOR_URL =
  "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/PATROCINADORES/logo_linq_azul_cor_1x.png";

type Props = {
  showBack?: boolean;
  categories: Category[];
};

export function Header({ showBack = false, categories }: Props) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between"
      style={{
        background: "var(--bg)",
        padding: "18px 22px",
        borderBottom: "0.5px solid var(--ink-ghost)",
        transition: "background 200ms ease",
      }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href="/"
            aria-label="Voltar para o cardápio"
            className="flex items-center justify-center"
            style={{ width: 14, height: 14 }}
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden>
              <path
                d="M6.5 1L1.5 6L6.5 11"
                stroke="var(--ink)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
        <Link
          href="/"
          aria-label="Kanpai Blue, ir para o cardápio"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <Image
            src={LOGO_URL}
            alt="Kanpai Blue"
            width={1280}
            height={352}
            priority
            sizes="(max-width: 767px) 88px, 104px"
            style={{
              height: 22,
              width: "auto",
              display: "block",
            }}
          />
        </Link>

        {/* Separador hairline entre marca e patrocinador */}
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "0.5px",
            height: 16,
            background: "var(--ink-faint)",
            flexShrink: 0,
          }}
        />

        {/* Patrocinador */}
        <span
          aria-label="Linq Telecom, patrocinador"
          role="img"
          style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
        >
          <Image
            src={SPONSOR_URL}
            alt="Linq Telecom, patrocinador"
            width={2120}
            height={782}
            sizes="(max-width: 767px) 60px, 72px"
            style={{
              height: 22,
              width: "auto",
              display: "block",
            }}
          />
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SearchBar categories={categories} />
        <FontSizeToggle />
      </div>
    </header>
  );
}
