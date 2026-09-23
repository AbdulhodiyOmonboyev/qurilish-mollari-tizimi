import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ff5500", // Hard Wall Primary Flame Orange
          600: "#ea4e00",
          700: "#c23e00",
          800: "#9a3200",
          900: "#7c2a00",
          950: "#431407",
        },
        hardwall: {
          orange: "#FF5500",
          accent: "#FF6A1A",
          dark: "#0B0F19",
          slate: "#111827",
          card: "#182032",
        },
      },
    },
  },
  plugins: [],
};
export default config;
