import type { Config } from "tailwindcss";

/**
 * Tailwind v4는 주로 globals.css의 @theme로 테마를 정의합니다.
 * 이 설정은 keyframes, animation 등 확장이 필요한 경우 사용됩니다.
 * _mockup/v0 디자인: 보라색 계열(oklch hue 280), glassmorphism, gradient-x 애니메이션
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 3s ease infinite",
      },
      fontFamily: {
        sans: ["var(--font-nunito-sans)", "Nunito Sans", "system-ui", "sans-serif"],
        heading: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        card: "var(--card)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
