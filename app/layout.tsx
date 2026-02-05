import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { PageBackground } from "@/components/common/PageBackground";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { Toaster } from "@/components/ui/toast";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = theme === 'dark' || (!theme && prefersDark);
                if (isDark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${nunito.variable} ${nunitoSans.variable} font-sans antialiased min-h-screen`}
      >
        <AuthProvider>
          <ThemeProvider>
            <PageBackground />
            <div className="min-h-screen flex flex-col relative">
              <Header />
              <main className="flex-1 pt-16 animate-in fade-in duration-500">{children}</main>
              <Footer />
            </div>
            <LoginModal />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
