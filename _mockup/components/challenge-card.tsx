"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Users, Trophy } from "lucide-react"

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  genre: string
  endDate: Date
  participantCount: number
  storyCount: number
  status: "active" | "upcoming" | "ended"
}

export function ChallengeCard({
  id,
  title,
  description,
  genre,
  endDate,
  participantCount,
  storyCount,
  status,
}: ChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        return "종료됨"
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        return `${days}일 ${hours}시간 남음`
      }
      return `${hours}시간 ${minutes}분 남음`
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    return () => clearInterval(timer)
  }, [endDate])

  const statusConfig = {
    active: { label: "진행 중", className: "bg-primary/10 text-primary" },
    upcoming: { label: "예정됨", className: "bg-secondary/50 text-secondary-foreground" },
    ended: { label: "종료됨", className: "bg-muted text-muted-foreground" },
  }

  // Calculate progress percentage
  const maxParticipants = 300
  const participationProgress = Math.min((participantCount / maxParticipants) * 100, 100)

  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500 pointer-events-none" />
      
      {/* Animated Status Banner with Particles */}
      {status === "active" && (
        <>
          <div className="relative bg-gradient-to-r from-primary via-secondary to-primary h-1 animate-gradient-x" />
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-white/50 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        </>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <Badge className={statusConfig[status].className}>
              {statusConfig[status].label}
            </Badge>
          </div>
          <Badge variant="outline">{genre}</Badge>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

        {/* Progress Bar */}
        {status === "active" && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>참여도</span>
              <span>{Math.round(participationProgress)}%</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out rounded-full"
                style={{ width: `${participationProgress}%` }}
              >
                <div className="h-full bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
            <Users className="h-4 w-4" />
            <span>{participantCount}명 참여</span>
          </div>
          <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>{storyCount}개 스토리</span>
          </div>
        </div>

        {/* Participation Badge */}
        {status === "ended" && storyCount > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">우수작 배지 수여</span>
            </div>
          </div>
        )}

        {/* Action */}
        <Link href={`/challenges/${id}`}>
          <Button 
            className="w-full group-hover:scale-105 transition-transform" 
            disabled={status === "ended"}
          >
            {status === "active" ? "참여 스토리 보기" : status === "upcoming" ? "자세히 보기" : "결과 보기"}
          </Button>
        </Link>
      </div>
    </div>
  )
}
