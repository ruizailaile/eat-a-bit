import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "16px",
      screens: {
        "2xl": "480px", // 移动端优先，最大宽度 480px
      },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7A9E6E",
          light: "#A8E6A1",
          dark: "#5A7D4E",
          50: "#F3F7F0",
          100: "#E6F0DF",
          200: "#CDE0C0",
          300: "#A8C99A",
          400: "#8BB47B",
          500: "#7A9E6E",
          600: "#648458",
          700: "#4F6A47",
          800: "#3D5238",
          900: "#2C3B29",
        },
        accent: {
          DEFAULT: "#E8913A",
          light: "#FFB970",
          dark: "#C97520",
        },
        background: "#F5F7F2",
        card: "#FFFFFF",
        text: {
          DEFAULT: "#2C3B29",
          sub: "#7A8A75",
          muted: "#AAB5A6",
        },
        border: "#E5E9E0",
      },
      borderRadius: {
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0, 0, 0, 0.06), 0 0 0 0.5px rgba(255, 255, 255, 0.6) inset",
        soft: "0 4px 20px rgba(122, 158, 110, 0.12)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
