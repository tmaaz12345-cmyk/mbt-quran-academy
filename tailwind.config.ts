import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#064E3B",
          950: "#032821",
          900: "#043D2F",
          800: "#064E3B",
          700: "#0B6B52",
          600: "#0F8768",
        },
        gold: {
          DEFAULT: "#D97706",
          light: "#F2A73B",
          dark: "#B45F04",
        },
        ivory: {
          DEFAULT: "#FDFBF7",
          dim: "#F5F1E8",
        },
        charcoal: {
          DEFAULT: "#1F2937",
          soft: "#374151",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
      },
      backgroundImage: {
        "geo-pattern":
          "radial-gradient(circle at 1px 1px, rgba(217,119,6,0.15) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
export default config;
