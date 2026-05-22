import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-warm":   "#FAFAF8",
        "bg-card":   "#FBFAF6",
        ink:         "#1A0E6E",
        "ink-soft":  "rgba(26, 14, 110, 0.55)",
        "ink-faint": "rgba(26, 14, 110, 0.18)",
        "ink-ghost": "rgba(26, 14, 110, 0.12)",
        "ink-trace": "rgba(26, 14, 110, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
