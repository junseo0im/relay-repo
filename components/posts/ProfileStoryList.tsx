"use client"

import Link from "next/link"
import { BookOpen, ChevronRight, Heart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import type { ProfileStory } from "@/lib/types"

interface ProfileStoryListProps {
  stories: ProfileStory[]
  type: "participated" | "liked"
  emptyMessage: string
}

export function ProfileStoryList({ stories, type, emptyMessage }: ProfileStoryListProps) {
  if (stories.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={
          type === "participated"
            ? "스토리에 참여하고 나만의 이야기를 이어가 보세요"
            : "마음에 드는 스토리에 좋아요를 눌러보세요"
        }
        actionLabel={type === "participated" ? "스토리 둘러보기" : "스토리 둘러보기"}
        actionHref="/"
      />
    )
  }

  return (
    <div className="space-y-3">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/story/${story.id}`}
          className="flex items-center gap-4 p-4 bg-card/60 rounded-xl border border-border/50 hover:bg-card hover:shadow-sm transition-all group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                {story.title}
              </h4>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {story.genre}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {story.likes}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {story.turns}턴
              </span>
              {type === "participated" && story.myTurns && (
                <span className="text-primary">내 턴 {story.myTurns}개</span>
              )}
              <span className="text-xs">{story.lastActivity}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      ))}
    </div>
  )
}
