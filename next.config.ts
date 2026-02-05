import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API route에서 env 로드가 안 될 때 next.config로 명시적 전달
  // (API route는 서버 전용이므로 클라이언트에 노출되지 않음)
  env: {
    GOOGLE_GENERATIVE: process.env.GOOGLE_GENERATIVE,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
};

export default nextConfig;
