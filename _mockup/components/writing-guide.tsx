"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

interface WritingGuideProps {
  genre?: string
}

export function WritingGuide({ genre = "판타지" }: WritingGuideProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  const tips = [
    {
      title: "스토리 톤 유지하기",
      description: "이전 문단들의 분위기와 문체를 유지하면서 자연스럽게 이어가보세요.",
      icon: TrendingUp,
      color: "text-blue-500"
    },
    {
      title: "캐릭터 일관성",
      description: "등장인물의 성격과 행동 패턴을 일관되게 유지해주세요.",
      icon: Sparkles,
      color: "text-purple-500"
    },
    {
      title: "갈등 심화하기",
      description: "이야기에 긴장감을 더하는 새로운 갈등이나 반전을 추가해보세요.",
      icon: Lightbulb,
      color: "text-orange-500"
    },
  ]

  const suggestions = [
    "소녀는 정령의 말에 놀라움을 감추지 못했다.",
    "숲 깊은 곳에서 이상한 소리가 들려왔다.",
    "빛이 갑자기 어두워지며 주변이 고요해졌다.",
  ]

  const storyAnalysis = {
    tone: "신비로운",
    pace: "중간",
    nextDirection: "캐릭터의 선택과 결정"
  }

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
  }

  const currentTip = tips[currentTipIndex]
  const TipIcon = currentTip.icon

  return (
    <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm border-border/50 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">작성 가이드</h3>
            <p className="text-xs text-muted-foreground">AI 기반 작성 도우미</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top duration-300">
          {/* Current Tip */}
          <div className="bg-background/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-muted ${currentTip.color}`}>
                <TipIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">{currentTip.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentTip.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextTip}
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Story Analysis */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              현재 스토리 분석
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-background/50">
                톤: {storyAnalysis.tone}
              </Badge>
              <Badge variant="secondary" className="bg-background/50">
                페이스: {storyAnalysis.pace}
              </Badge>
              <Badge variant="secondary" className="bg-background/50">
                다음 방향: {storyAnalysis.nextDirection}
              </Badge>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              문장 제안
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    // In production, this would insert the suggestion
                    console.log("[v0] Suggestion clicked:", suggestion)
                  }}
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>

          {/* Genre-specific Tips */}
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-xs text-primary">
              <strong>{genre} 장르 팁:</strong> 신비로운 요소를 활용하여 독자의 호기심을 자극하세요.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
