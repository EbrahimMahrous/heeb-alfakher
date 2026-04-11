import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#338A43",
        white: "#FFFFFF",
        orange: "#FF8531",
        dark: "#161616",
        neutral: {
          500: "#64748B",
          400: "#94A3B8",
          200: "#EEEEEE",
          100: "#ECFDF5",
        },
      },
      fontFamily: {
        arabic: ["ArabicModern", "Israr_Syria", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
