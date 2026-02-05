"use client"

import { useState } from "react"
import { BookOpen, Heart, PenLine, Send, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AuthorProfilePopover } from "@/components/posts/AuthorProfilePopover"
import type { Epilogue } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX_EPILOGUE_CHARS = 300

interface EpilogueSectionProps {
  storyId: string
  storyTitle: string
  epilogues: Epilogue[]
}

export function EpilogueSection({
  storyId,
  storyTitle,
  epilogues: initialEpilogues,
}: EpilogueSectionProps) {
  const [epilogues, setEpilogues] = useState(initialEpilogues)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
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
              placeholder="예: 그 후 그녀는..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_EPILOGUE_CHARS))}
              rows={4}
              className="resize-none mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/{MAX_EPILOGUE_CHARS}자
              </span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
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
              <div
                key={ep.id}
                className={cn(
                  "group p-4 rounded-2xl border border-border/50 bg-card/40",
                  "hover:border-primary/20 hover:bg-card/60 transition-all"
                )}
              >
                <div className="flex items-start gap-3">
                  <AuthorProfilePopover
                    authorId={ep.authorId}
                    authorName={ep.author}
                    authorAvatar={ep.authorAvatar}
                  >
                    <button className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity text-left">
                      <Avatar className="h-8 w-8">
                        {ep.authorAvatar ? (
                          <img src={ep.authorAvatar} alt={ep.author} />
                        ) : (
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {ep.author.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {ep.author}
                        <PenLine className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </button>
                  </AuthorProfilePopover>
                  <span className="text-xs text-muted-foreground">
                    {ep.createdAt}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed pl-10">{ep.content}</p>
                {ep.likes !== undefined && ep.likes > 0 && (
                  <div className="flex items-center gap-1 mt-2 pl-10 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    {ep.likes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
