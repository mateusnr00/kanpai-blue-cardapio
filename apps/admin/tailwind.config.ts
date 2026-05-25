import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-app": "#f4f5f9",
        "bg-surface": "#ffffff",
        "bg-muted": "#eef0f6",
        "bg-warm": "#f4f5f9",
        "bg-card": "#ffffff",
        ink: {
          DEFAULT: "#1a0e6e",
          secondary: "#4a4580",
          muted: "#7c78a8",
          soft: "#7c78a8",
          faint: "#c8c5dc",
          ghost: "#e8e6f2",
          trace: "#e8e6f2",
        },
        accent: {
          DEFAULT: "#2d4ae8",
          hover: "#2340d4",
          soft: "rgba(45, 74, 232, 0.1)",
        },
        danger: {
          DEFAULT: "#dc2626",
          soft: "rgba(220, 38, 38, 0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
