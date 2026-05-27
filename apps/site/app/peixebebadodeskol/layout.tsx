import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanpai Blue",
  robots: { index: false, follow: false },
};

export default function PeixeBebadoDeskolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
