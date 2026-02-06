"use client"

import { useState, useEffect } from "react"
import { BookOpen, Heart, Loader2, PenLine, Send, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AuthorProfilePopover } from "@/components/posts/AuthorProfilePopover"
import { createEpilogue } from "@/actions/epilogue"
import { toggleEpilogueLike } from "@/actions/likes"
import { useToast } from "@/hooks/use-toast"
import type { Epilogue } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX_EPILOGUE_CHARS = 300

function EpilogueCard({
  epilogue,
  isLiked: initialIsLiked,
  isLoggedIn,
  onLikeToggle,
}: {
  epilogue: Epilogue
  isLiked: boolean
  isLoggedIn: boolean
  onLikeToggle: (epilogueId: string) => Promise<{ success: boolean; liked?: boolean; likeCount?: number; error?: string }>
}) {
  const [likes, setLikes] = useState(epilogue.likes ?? 0)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isPending, setIsPending] = useState(false)

  const handleLike = async () => {
    if (!isLoggedIn || isPending) return
    setIsPending(true)
    const prev = isLiked
    setIsLiked(!prev)
    setLikes((c) => (prev ? c - 1 : c + 1))
    const result = await onLikeToggle(epilogue.id)
    setIsPending(false)
    if (result.success) {
      setIsLiked(result.liked ?? false)
      setLikes(result.likeCount ?? 0)
    } else {
      setIsLiked(prev)
      setLikes((c) => (prev ? c + 1 : c - 1))
    }
  }

  return (
    <div
      className={cn(
        "group p-4 rounded-2xl border border-border/50 bg-card/40",
        "hover:border-primary/20 hover:bg-card/60 transition-all"
      )}
    >
      <div className="flex items-start gap-3">
        <AuthorProfilePopover
          authorId={epilogue.authorId}
          authorName={epilogue.author}
          authorAvatar={epilogue.authorAvatar}
        >
          <button className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity text-left">
            <Avatar className="h-8 w-8">
              {epilogue.authorAvatar ? (
                <img src={epilogue.authorAvatar} alt={epilogue.author} />
              ) : (
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {epilogue.author.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {epilogue.author}
              <PenLine className="h-3 w-3 text-muted-foreground" />
            </span>
          </button>
        </AuthorProfilePopover>
        <span className="text-xs text-muted-foreground">{epilogue.createdAt}</span>
      </div>
      <p className="text-foreground leading-relaxed pl-10">{epilogue.content}</p>
      <div className="flex items-center gap-2 mt-2 pl-10">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-muted-foreground hover:text-destructive",
            isLiked && "text-destructive"
          )}
          onClick={handleLike}
          disabled={!isLoggedIn || isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          )}
          {likes}
        </Button>
      </div>
    </div>
  )
}

interface EpilogueSectionProps {
  storyId: string
  storyTitle: string
  epilogues: Epilogue[]
  isLoggedIn?: boolean
  likedEpilogueIds?: string[]
}

export function EpilogueSection({
  storyId,
  storyTitle,
  epilogues: initialEpilogues,
  isLoggedIn = false,
  likedEpilogueIds = [],
}: EpilogueSectionProps) {
  const [epilogues, setEpilogues] = useState(initialEpilogues)
  const [content, setContent] = useState("")

  useEffect(() => {
    setEpilogues(initialEpilogues)
  }, [initialEpilogues])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    if (!isLoggedIn) {
      toast({ variant: "destructive", title: "로그인이 필요합니다" })
      return
    }
    setIsSubmitting(true)
    const result = await createEpilogue({ roomId: storyId, content: content.trim() })
    if (result.success) {
      setEpilogues((prev) => [
        ...prev,
        {
          id: `ep-${Date.now()}`,
          author: "나",
          content: content.trim(),
          createdAt: "방금 전",
          likes: 0,
        },
      ])
      setContent("")
      toast({ title: "에필로그가 등록되었습니다" })
    } else {
      toast({ variant: "destructive", title: result.error })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">에필로그</h2>
          <p className="text-sm text-muted-foreground">
            이야기를 읽고 나만의 마무리를 써보세요. 다른 독자들의 에필로그도 확인할 수 있어요.
          </p>
        </div>
      </div>

      <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-1">에필로그 작성하기</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {storyTitle}의 결말에 대해 나만의 생각이나 이어지는 이야기를 짧게 써보세요. (최대{" "}
              {MAX_EPILOGUE_CHARS}자)
            </p>
            <Textarea
              placeholder={isLoggedIn ? "예: 그 후 그녀는..." : "로그인 후 에필로그를 작성할 수 있어요"}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_EPILOGUE_CHARS))}
              rows={4}
              className="resize-none mb-2"
              disabled={!isLoggedIn}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/{MAX_EPILOGUE_CHARS}자
              </span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!isLoggedIn || !content.trim() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    작성 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    에필로그 작성
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {epilogues.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground mb-2">
            다른 독자들의 에필로그 ({epilogues.length})
          </h3>
          <div className="space-y-3">
            {epilogues.map((ep) => (
              <EpilogueCard
                key={ep.id}
                epilogue={ep}
                isLiked={likedEpilogueIds.includes(ep.id)}
                isLoggedIn={isLoggedIn}
                onLikeToggle={toggleEpilogueLike}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
