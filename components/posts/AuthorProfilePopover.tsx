"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ExternalLink, Heart, Loader2, PenLine } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AuthorStats {
  storiesCount: number
  totalLikes: number
  totalTurns: number
  badge?: string
}

interface AuthorProfilePopoverProps {
  authorId?: string
  authorName: string
  authorAvatar?: string
  children: React.ReactNode
}

export function AuthorProfilePopover({
  authorId,
  authorName,
  authorAvatar,
  children,
}: AuthorProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authorData, setAuthorData] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) setAuthorData(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !authorId) return
    setLoading(true)
    setAuthorData(null)
    fetch(`/api/author/${authorId}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setAuthorData({
          storiesCount: data.storiesCount ?? 0,
          totalLikes: data.totalLikes ?? 0,
          totalTurns: data.totalTurns ?? 0,
          badge: data.badge,
        })
      })
      .catch(() => setAuthorData(null))
      .finally(() => setLoading(false))
  }, [isOpen, authorId])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden bg-card/95 backdrop-blur-md border-border/50"
        align="start"
        side="top"
      >
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 p-6 pb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />

          <div className="relative flex items-start gap-3">
            <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 mt-1">
              <h3 className="font-bold text-lg text-foreground mb-1">{authorName}</h3>
              {authorData?.badge && (
                <Badge variant="secondary" className="bg-background/80 text-xs">
                  {authorData.badge}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {(authorData || loading) && (
          <div className="grid grid-cols-3 gap-px bg-border/50 -mt-8 relative z-10 mx-4 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-card/95 backdrop-blur-sm p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <BookOpen className="h-3 w-3" />
                <span>스토리</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : authorData?.storiesCount ?? 0}
              </div>
            </div>
            <div className="bg-card/95 backdrop-blur-sm p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Heart className="h-3 w-3" />
                <span>좋아요</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : authorData?.totalLikes ?? 0}
              </div>
            </div>
            <div className="bg-card/95 backdrop-blur-sm p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <PenLine className="h-3 w-3" />
                <span>턴</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : authorData?.totalTurns ?? 0}
              </div>
            </div>
          </div>
        )}

        {authorId && (
          <div className="p-4 pt-6">
            <Link href={`/profile/${authorId}`}>
              <Button
                className="w-full gap-2"
                variant="default"
                onClick={() => setIsOpen(false)}
              >
                <ExternalLink className="h-4 w-4" />
                프로필 전체보기
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
