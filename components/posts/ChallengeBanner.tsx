"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, Flame, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ActiveChallenge } from "@/lib/queries/challenge"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(endAt: string): TimeLeft {
  const end = new Date(endAt).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((diff % (60 * 1000)) / 1000)
  return { days, hours, minutes, seconds }
}

interface ChallengeBannerProps {
  challenge: ActiveChallenge | null
}

export function ChallengeBanner({ challenge }: ChallengeBannerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    challenge ? getTimeLeft(challenge.endAt) : null
  )

  useEffect(() => {
    if (!challenge) return
    setTimeLeft(getTimeLeft(challenge.endAt))
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(challenge.endAt))
    }, 1000)
    return () => clearInterval(timer)
  }, [challenge])

  if (!challenge) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 to-secondary/90 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-white/80 text-sm font-medium">스토리 챌린지</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
                  다음 챌린지를 기다려주세요
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  곧 새로운 주제의 챌린지가 시작됩니다
                </p>
              </div>
            </div>
            <Link href="/challenges">
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                챌린지 둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const isActive = challenge.status === "active"

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 to-secondary/90 p-6 md:p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white/80 text-sm font-medium">
                  진행 중인 챌린지
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {challenge.title}
              </h3>
              <p className="text-white/70 text-sm">
                {challenge.description || "함께 이야기를 이어가 보세요"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {timeLeft && (
              <div className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5" />
                <div className="flex gap-2">
                  {[
                    { value: timeLeft.days, label: "일" },
                    { value: timeLeft.hours, label: "시" },
                    { value: timeLeft.minutes, label: "분" },
                    { value: timeLeft.seconds, label: "초" },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[48px] border border-white/10 transition-all hover:bg-white/30 hover:scale-105">
                        <span className="text-xl font-bold tabular-nums">
                          {String(item.value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-xs text-white/70 mt-1 block">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Link href="/challenges">
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                챌린지 스토리 보기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
