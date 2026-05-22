"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: "#FBFAF6", color: "#1A0E6E", border: "1px solid rgba(26,14,110,0.18)" },
      }}
    />
  );
}
