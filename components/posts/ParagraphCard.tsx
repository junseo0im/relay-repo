"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AuthorProfilePopover } from "@/components/posts/AuthorProfilePopover"
import { toggleTurnLike } from "@/actions/likes"
import { cn } from "@/lib/utils"
import type { Paragraph } from "@/lib/types"

interface ParagraphCardProps extends Paragraph {
  isLiked?: boolean
}

export function ParagraphCard({
  author,
  authorId,
  authorAvatar,
  content,
  turnNumber,
  createdAt,
  likes = 0,
  turnId,
  isLiked: initialIsLiked = false,
}: ParagraphCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = async () => {
    if (!turnId) return

    const prevLiked = isLiked
    const prevCount = likeCount
    setIsLiked(!prevLiked)
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1)

    const result = await toggleTurnLike(turnId)
    if (!result.success) {
      setIsLiked(prevLiked)
      setLikeCount(prevCount)
    } else {
      setIsLiked(result.liked)
      setLikeCount(result.likeCount)
    }
  }

  return (
    <div className="group relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border group-last:hidden" />

      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center group-hover:scale-110 transition-transform">
        <span className="text-xs font-bold text-primary">{turnNumber}</span>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <AuthorProfilePopover
            authorId={authorId}
            authorName={author}
            authorAvatar={authorAvatar}
          >
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/30 transition-all">
                <AvatarImage src={authorAvatar} alt={author} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {author.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium text-card-foreground">{author}</span>
                <span className="text-xs text-muted-foreground ml-2">{createdAt}</span>
              </div>
            </div>
          </AuthorProfilePopover>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn("gap-1.5 transition-all hover:scale-105", isLiked && "text-destructive")}
          >
            <Heart className={cn("h-4 w-4 transition-all", isLiked && "fill-destructive")} />
            <span className="text-sm font-medium">{likeCount}</span>
          </Button>
        </div>

        <p className="text-card-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
