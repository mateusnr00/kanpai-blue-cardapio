import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { FontSizeProvider } from "@/components/FontSizeProvider";
import { LikesProvider } from "@/components/LikesProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ConsentBanner } from "@/components/ConsentBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanpai Blue | Cardápio",
  description: "Cardápio digital do Kanpai Blue, restaurante japonês contemporâneo em Goiânia.",
  icons: {
    icon: "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/favicon%20kanpai.png",
    shortcut: "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/favicon%20kanpai.png",
    apple: "https://rxzohyrttklxevegdijm.supabase.co/storage/v1/object/public/LOGOS/favicon%20kanpai.png",
  },
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
        <Suspense fallback={null}>
          <PostHogProvider>
            <FontSizeProvider>
              <LikesProvider>{children}</LikesProvider>
            </FontSizeProvider>
            <ConsentBanner />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
