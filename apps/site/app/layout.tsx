import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { FontSizeProvider } from "@/components/FontSizeProvider";
import { LikesProvider } from "@/components/LikesProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanpai Blue · Cardápio",
  description: "Cardápio digital do Kanpai Blue, restaurante japonês contemporâneo em Goiânia.",
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-text-size="default" className={inter.variable}>
      <head>
        {/* Preconnect ao Supabase Storage — economiza DNS+TLS handshake no primeiro fetch de foto */}
        <link
          rel="preconnect"
          href="https://rxzohyrttklxevegdijm.supabase.co"
          crossOrigin=""
        />
      </head>
      <body>
        <FontSizeProvider>
          <LikesProvider>{children}</LikesProvider>
        </FontSizeProvider>
      </body>
    </html>
  );
}
