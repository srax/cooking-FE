import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: "#fcd845",
        darkgray: "#9f9b9f",
        violet: "rgba(255,141,247,0.2)",
      },
      boxShadow: {
        "pseudo-3d":
          "2px 2px 4px 0px rgba(0, 0, 0, 0.6), 8px 8px 12px 0px rgba(0, 0, 0, 0.3)",
      },
      fontFamily: {
        cofo: ["CoFo", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        jersey25Regular: ["Jersey25Regular", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        fade: "fade 1.5s ease-in-out infinite",
      },
      keyframes: {
        fade: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  darkMode: "class",
  mode: "jit",
  plugins: [heroui()],
} satisfies Config;
