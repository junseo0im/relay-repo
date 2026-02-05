"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Lightbulb, RefreshCw, Sparkles, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { GuideResponse } from "@/app/api/guide/route"

interface WritingGuideProps {
  roomId: string
  genre?: string
}

const DEFAULT_TIPS = [
  {
    title: "스토리 톤 유지하기",
    description: "이전 문단들의 분위기와 문체를 유지하면서 자연스럽게 이어가보세요.",
    icon: TrendingUp,
    color: "text-blue-500",
  },
  {
    title: "캐릭터 일관성",
    description: "등장인물의 성격과 행동 패턴을 일관되게 유지해주세요.",
    icon: Sparkles,
    color: "text-purple-500",
  },
  {
    title: "갈등 심화하기",
    description: "이야기에 긴장감을 더하는 새로운 갈등이나 반전을 추가해보세요.",
    icon: Lightbulb,
    color: "text-orange-500",
  },
]

export function WritingGuide({ roomId, genre = "판타지" }: WritingGuideProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [guide, setGuide] = useState<GuideResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuide = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as GuideResponse
      setGuide(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "가이드를 불러오지 못했습니다")
      setGuide(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuide()
  }, [roomId])

  const handleNextTip = () => {
    const tips = guide?.tips ?? DEFAULT_TIPS
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
  }

  const tips = guide?.tips?.length
    ? guide.tips.map((t) => ({ title: t.title, description: t.description }))
    : DEFAULT_TIPS.map((t) => ({ title: t.title, description: t.description }))
  const currentTip = tips[currentTipIndex % tips.length]
  const tipMeta = DEFAULT_TIPS[currentTipIndex % DEFAULT_TIPS.length]
  const TipIcon = tipMeta?.icon ?? Lightbulb
  const tipColor = tipMeta?.color ?? "text-blue-500"

  const storyAnalysis = {
    tone: guide?.tone ?? "분석 중",
    pace: guide?.pace ?? "-",
    nextDirection: guide?.nextDirection ?? "-",
  }

  const suggestions = guide?.suggestions?.length ? guide.suggestions : [
    "소녀는 정령의 말에 놀라움을 감추지 못했다.",
    "숲 깊은 곳에서 이상한 소리가 들려왔다.",
    "빛이 갑자기 어두워지며 주변이 고요해졌다.",
  ]

  return (
    <Card className="h-fit bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI 도우미</h3>
            <p className="text-xs text-muted-foreground">톤·문장 제안</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-3 animate-in fade-in slide-in-from-top duration-200">
          {loading ? (
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-muted/50 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-muted/50 animate-pulse" />
                <div className="h-6 w-20 rounded bg-muted/50 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-10 rounded bg-muted/50 animate-pulse" />
                <div className="h-10 rounded bg-muted/50 animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl p-4 border border-destructive/30 bg-destructive/5">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchGuide} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-md bg-background/50 ${tipColor}`}>
                    <TipIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">
                      {currentTip?.title ?? "스토리 톤 유지하기"}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentTip?.description ??
                        "이전 문단들의 분위기와 문체를 유지하면서 자연스럽게 이어가보세요."}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleNextTip} className="shrink-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  스토리 분석
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs font-normal bg-background/50 py-0">
                    톤: {storyAnalysis.tone}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal bg-background/50 py-0">
                    페이스: {storyAnalysis.pace}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-normal bg-background/50 py-0">
                    다음 방향: {storyAnalysis.nextDirection}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  문장 제안
                </h4>
                <div className="space-y-1.5">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left p-2.5 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        console.log("[WritingGuide] Suggestion clicked:", suggestion)
                      }}
                    >
                      &quot;{suggestion}&quot;
                    </button>
                  ))}
                </div>
              </div>

              {(guide?.genreTip ?? genre) && (
                <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/20">
                  <p className="text-xs text-primary leading-relaxed">
                    <strong>{genre} 장르 팁:</strong>{" "}
                    {guide?.genreTip ?? "신비로운 요소를 활용하여 독자의 호기심을 자극하세요."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  )
}
