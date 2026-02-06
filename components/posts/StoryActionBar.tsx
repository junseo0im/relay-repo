"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookCheck, Heart, Loader2, Sparkles, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FullStoryView } from "@/components/posts/FullStoryView"
import { cn } from "@/lib/utils"
import type { Paragraph } from "@/lib/types"
import { toggleStoryLike } from "@/actions/likes"
import { completeStory } from "@/actions/story"

interface StoryActionBarProps {
  roomId: string
  title: string
  paragraphs: Paragraph[]
  likeCount: number
  isLiked: boolean
  isChallenge?: boolean
  canComplete?: boolean
}

export function StoryActionBar({
  roomId,
  title,
  paragraphs,
  likeCount: initialLikeCount,
  isLiked: initialIsLiked,
  isChallenge,
  canComplete,
}: StoryActionBarProps) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isPending, setIsPending] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const handleComplete = async () => {
    if (!canComplete || isCompleting) return
    setIsCompleting(true)
    const result = await completeStory(roomId)
    setIsCompleting(false)
    if (result.success) {
      router.push(`/story/${roomId}/cover`)
    }
  }

  const handleLike = async () => {
    if (isPending) return
    setIsPending(true)
    const prevLiked = isLiked
    setIsLiked(!prevLiked)
    setLikeCount((c) => (prevLiked ? c - 1 : c + 1))

    const result = await toggleStoryLike(roomId)
    setIsPending(false)

    if (!result.success) {
      setIsLiked(prevLiked)
      setLikeCount((c) => (prevLiked ? c + 1 : c - 1))
    } else {
      setIsLiked(result.liked)
      setLikeCount(result.likeCount)
    }
  }

  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleSummary = async () => {
    if (showSummary) {
      setShowSummary(false)
      return
    }
    setShowSummary(true)
    if (summary !== null) return
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSummaryError(data.error || "요약 생성에 실패했습니다")
        return
      }
      setSummary(data.summary ?? "")
    } catch {
      setSummaryError("요약을 불러오지 못했습니다")
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50">
        <Button
          variant={isLiked ? "default" : "outline"}
          onClick={handleLike}
          disabled={isPending}
          className={cn("gap-2", isLiked && "bg-destructive hover:bg-destructive/90")}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          좋아요 {likeCount}
        </Button>

        <FullStoryView title={title} paragraphs={paragraphs} />

        <Button variant="outline" onClick={handleSummary} className="gap-2 bg-transparent">
          <Sparkles className="h-4 w-4" />
          AI 줄거리 요약
        </Button>

        {canComplete && (
          <Button
            variant="default"
            onClick={handleComplete}
            disabled={isCompleting}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookCheck className="h-4 w-4" />
            )}
            완성하기
          </Button>
        )}

        {isChallenge && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">챌린지 참여작</span>
          </div>
        )}
      </div>

      {showSummary && (
        <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-card-foreground">AI 줄거리 요약</h4>
          </div>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>요약 생성 중...</span>
            </div>
          ) : summaryError ? (
            <p className="text-destructive text-sm">{summaryError}</p>
          ) : (
            <p className="text-muted-foreground leading-relaxed">{summary}</p>
          )}
        </div>
      )}
    </div>
  )
}
