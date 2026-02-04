import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" });

export const metadata: Metadata = {
  title: "각자 - 함께 이야기를 완성하세요",
  description:
    "여러 사용자가 한 문단씩 번갈아 이어 쓰며 하나의 이야기를 완성하는 협업형 스토리텔링 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nunito.variable} ${nunitoSans.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-[oklch(0.92_0.03_280)] via-[oklch(0.95_0.02_250)] to-[oklch(0.92_0.04_220)]`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
