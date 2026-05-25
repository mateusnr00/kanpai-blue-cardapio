import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
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
        tremor: {
          brand: {
            faint: "rgba(45, 74, 232, 0.05)",
            muted: "rgba(45, 74, 232, 0.15)",
            subtle: "rgba(45, 74, 232, 0.25)",
            DEFAULT: "#2d4ae8",
            emphasis: "#2340d4",
            inverted: "#ffffff",
          },
          background: {
            muted: "#f4f5f9",
            subtle: "#eef0f6",
            DEFAULT: "#ffffff",
            emphasis: "#1a0e6e",
          },
          border: { DEFAULT: "#e8e6f2" },
          ring: { DEFAULT: "#e8e6f2" },
          content: {
            subtle: "#7c78a8",
            DEFAULT: "#4a4580",
            emphasis: "#1a0e6e",
            strong: "#1a0e6e",
            inverted: "#ffffff",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
