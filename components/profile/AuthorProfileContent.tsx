"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, Heart, PenLine } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProfileStoryList } from "@/components/posts/ProfileStoryList"
import type { AuthorProfile } from "@/lib/queries/profile"
import type { ProfileStory } from "@/lib/types"

interface AuthorProfileContentProps {
  author: AuthorProfile
  participatedStories: ProfileStory[]
}

function getBadge(storiesCount: number, totalLikes: number): string | null {
  if (storiesCount >= 10 && totalLikes >= 1000) return "전설 작가"
  if (storiesCount >= 5 && totalLikes >= 500) return "베테랑 작가"
  if (storiesCount >= 3 || totalLikes >= 200) return "인기 작가"
  return null
}

export function AuthorProfileContent({
  author,
  participatedStories,
}: AuthorProfileContentProps) {
  const badge = getBadge(author.storiesCount, author.totalLikes)

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로 돌아가기</span>
        </Link>

        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              {author.avatarUrl && (
                <AvatarImage src={author.avatarUrl} alt={author.displayName} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {author.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-card-foreground">
                  {author.displayName}
                </h1>
                {badge && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {badge}
                  </Badge>
                )}
              </div>
              {author.bio && (
                <p className="text-muted-foreground mb-4">{author.bio}</p>
              )}
              {author.preferredGenres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  {author.preferredGenres.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-primary">
                    {author.storiesCount}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>스토리</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-destructive">
                    {author.totalLikes}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <Heart className="h-3 w-3" />
                    <span>좋아요</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-secondary">
                    {author.totalTurns}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <PenLine className="h-3 w-3" />
                    <span>턴</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">참여한 이야기</h2>
          </div>
          <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
            <ProfileStoryList
              stories={participatedStories}
              type="participated"
              emptyMessage="아직 참여한 이야기가 없습니다."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
