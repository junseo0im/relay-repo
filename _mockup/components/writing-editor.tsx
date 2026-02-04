"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { PenLine, Clock, Send, Loader2, Lock, Lightbulb, MessageSquare, Users } from "lucide-react"

const MAX_CHARS = 500
const WRITING_TIME = 5 * 60 // 5 minutes in seconds

export function WritingEditor() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [isWriting, setIsWriting] = useState(false)
  const [content, setContent] = useState("")
  const [timeLeft, setTimeLeft] = useState(WRITING_TIME)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isWriting) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isWriting])

  const handleStartWriting = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    setIsWriting(true)
    setTimeLeft(WRITING_TIME)
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsWriting(false)
    setContent("")
    alert("문단이 제출되었습니다!")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  if (!isWriting) {
    return (
      <div className="space-y-4">
        {/* Start Writing Section */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <PenLine className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            이야기를 이어가세요
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            다음 문단을 작성하여 이야기에 참여해보세요. 작성 시간은 5분입니다.
          </p>
          <Button onClick={handleStartWriting} size="lg" className="gap-2">
            <PenLine className="h-5 w-5" />
            이어쓰기 시작
          </Button>
        </div>

        {/* Phase 2 Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
          <div className="bg-card/50 rounded-2xl border border-dashed border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">턴 승인 패널</span>
            </div>
            <p className="text-xs text-muted-foreground">Phase 2에서 제공됩니다</p>
          </div>
          <div className="bg-card/50 rounded-2xl border border-dashed border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">턴 대기열</span>
            </div>
            <p className="text-xs text-muted-foreground">Phase 2에서 제공됩니다</p>
          </div>
          <div className="bg-card/50 rounded-2xl border border-dashed border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">AI 문장 추천</span>
            </div>
            <p className="text-xs text-muted-foreground">Phase 2에서 제공됩니다</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
      {/* Lock Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <Lock className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">작성 모드 활성화</p>
          <p className="text-xs text-primary/70">
            다른 사용자는 작성을 완료할 때까지 대기합니다
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary font-mono">
          <Clock className="h-4 w-4" />
          <span className={timeLeft < 60 ? "text-destructive" : ""}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <Textarea
          placeholder="이야기를 이어서 작성해주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          className="min-h-[200px] resize-none bg-background/50 text-base leading-relaxed"
          disabled={timeLeft === 0}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {content.length} / {MAX_CHARS} 글자
          </span>
          {timeLeft === 0 && (
            <span className="text-destructive">시간이 만료되었습니다</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setIsWriting(false)
            setContent("")
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || timeLeft === 0 || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          문단 제출
        </Button>
      </div>
    </div>
  )
}
