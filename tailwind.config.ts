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
        background: "var(--background)",
        foreground: "var(--foreground)",
        heritage: {
          50: "#fdf8f4",
          100: "#f9eee3",
          200: "#f2d9c4",
          300: "#e8be9e",
          400: "#dc9c71",
          500: "#d2814f",
          600: "#c46a42",
          700: "#a35237",
          800: "#834331",
          900: "#6b392b",
        },
      },
      keyframes: {
        pulseWave: {
          "0%, 100%": { height: "6px" },
          "50%": { height: "24px" },
        },
      },
      animation: {
        "pulse-wave": "pulseWave 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
