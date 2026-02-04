"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Heart, Sparkles, BookOpen, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoryActionBarProps {
  storyId: string
  likes: number
  isChallenge?: boolean
}

export function StoryActionBar({ storyId, likes: initialLikes, isChallenge }: StoryActionBarProps) {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const handleLike = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    setLiked(!liked)
    setLikes(prev => liked ? prev - 1 : prev + 1)
  }

  const handleSummary = () => {
    setShowSummary(!showSummary)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50">
        {/* Like Button */}
        <Button
          variant={liked ? "default" : "outline"}
          onClick={handleLike}
          className={cn(
            "gap-2",
            liked && "bg-destructive hover:bg-destructive/90"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          좋아요 {likes}
        </Button>

        {/* AI Summary Button */}
        <Button variant="outline" onClick={handleSummary} className="gap-2 bg-transparent">
          <Sparkles className="h-4 w-4" />
          AI 줄거리 요약
        </Button>

        {/* Full Story Button */}
        <Link href={`/story/${storyId}/full`}>
          <Button variant="outline" className="gap-2 bg-transparent">
            <BookOpen className="h-4 w-4" />
            스토리 합본 보기
          </Button>
        </Link>

        {/* Challenge Badge */}
        {isChallenge && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">챌린지 참여작</span>
          </div>
        )}
      </div>

      {/* AI Summary Panel */}
      {showSummary && (
        <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-card-foreground">AI 줄거리 요약</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            이 이야기는 주인공이 예상치 못한 상황에 처하면서 시작됩니다. 
            여러 작가들이 번갈아가며 쓴 문단들이 모여 독특한 플롯을 형성하고 있으며, 
            긴장감과 감동이 조화롭게 어우러진 전개가 특징입니다. 
            현재까지의 이야기는 주인공의 성장과 주변 인물들과의 관계 변화를 중심으로 
            진행되고 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}
