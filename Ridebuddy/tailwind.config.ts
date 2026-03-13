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
        primary: "#1A1A2E",
        accent: "#E94560",
        surface: "#16213E",
        surfaceElevated: "#0F3460",

        textPrimary: "#FFFFFF",
        textSecondary: "#B0BAD0",
        divider: "#2A2A4A",

        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6"
      },

      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        full: "999px"
      },

      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.25)",
        lg: "0 8px 32px rgba(0,0,0,0.45)"
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [],
};
export default config;
