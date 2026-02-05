"use client"

import { useTheme } from "@/components/providers/ThemeProvider"
import { cn } from "@/lib/utils"

export function PageBackground() {
  const { theme } = useTheme()

  const isDark = theme === "dark"

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 기본 그라데이션 */}
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          isDark
            ? "bg-gradient-to-br from-[oklch(0.22_0.03_280)] via-[oklch(0.25_0.02_260)] to-[oklch(0.2_0.04_300)]"
            : "bg-gradient-to-br from-[oklch(0.92_0.03_280)] via-[oklch(0.95_0.02_250)] to-[oklch(0.92_0.04_220)]"
        )}
      />

      {/* 은은한 오브 효과 */}
      <div
        className={cn(
          "absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full blur-3xl bg-orb transition-opacity duration-500",
          isDark ? "opacity-20" : "opacity-40"
        )}
        style={{
          background: isDark
            ? "radial-gradient(circle, oklch(0.5 0.15 280 / 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, oklch(0.7 0.12 280 / 0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className={cn(
          "absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] rounded-full blur-3xl bg-orb-slow transition-opacity duration-500",
          isDark ? "opacity-15" : "opacity-30"
        )}
        style={{
          background: isDark
            ? "radial-gradient(circle, oklch(0.55 0.1 220 / 0.25) 0%, transparent 70%)"
            : "radial-gradient(circle, oklch(0.75 0.1 220 / 0.3) 0%, transparent 70%)",
        }}
      />
      <div
        className={cn(
          "absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-3xl transition-opacity duration-500",
          isDark ? "opacity-10" : "opacity-20"
        )}
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.1 300 / 0.2) 0%, transparent 70%)",
          animation: "float-orb-slow 30s ease-in-out infinite",
        }}
      />
    </div>
  )
}
