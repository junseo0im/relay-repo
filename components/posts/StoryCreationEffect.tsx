"use client"

import { useEffect, useState } from "react"

interface StoryCreationEffectProps {
  isActive: boolean
  onComplete?: () => void
}

export function StoryCreationEffect({ isActive, onComplete }: StoryCreationEffectProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([])

  useEffect(() => {
    if (!isActive) return

    const count = 24
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      delay: Math.random() * 800,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => {
      onComplete?.()
    }, 2800)

    return () => clearTimeout(timer)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* 글로우 오버레이 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent story-creation-glow"
        aria-hidden
      />

      {/* 중앙 빛나는 원 */}
      <div
        className="absolute w-48 h-48 rounded-full bg-primary/30 blur-3xl animate-pulse"
        style={{ animationDuration: "1.5s" }}
        aria-hidden
      />
      <div
        className="absolute w-24 h-24 rounded-full bg-primary/50 blur-xl"
        style={{ animation: "story-glow-pulse 1.5s ease-in-out infinite" }}
        aria-hidden
      />

      {/* 상승하는 파티클 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-1/2 left-1/2 -translate-x-1/2"
          style={{ marginLeft: `${p.x}vw` }}
          aria-hidden
        >
          <div
            className="story-particle w-2 h-2 rounded-full bg-primary/60"
            style={{ animationDelay: `${p.delay}ms` }}
          />
        </div>
      ))}

      {/* 텍스트 */}
      <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <p className="text-2xl font-bold text-primary drop-shadow-lg">이야기가 탄생하고 있어요</p>
        <p className="text-sm text-muted-foreground mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  )
}
