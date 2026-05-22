import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          warm: "#FAFAF8",
          cool: "#F7F8FA",
          frame: "#F5EFE3",
          card: "#FBFAF6",
        },
        ink: {
          DEFAULT: "#1A0E6E",
          soft: "rgba(26, 14, 110, 0.55)",
          faint: "rgba(26, 14, 110, 0.18)",
          ghost: "rgba(26, 14, 110, 0.12)",
          trace: "rgba(26, 14, 110, 0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter: "-0.02em",
        tight: "-0.01em",
        widest2: "0.2em",
        widest3: "0.15em",
      },
      borderWidth: {
        hair: "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
