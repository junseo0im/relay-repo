import Link from "next/link"
import { ArrowLeft, BookOpen, Heart, PenLine, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProfileStoryList } from "@/components/posts/ProfileStoryList"
import { likedStories, participatedStories, popularAuthors } from "@/lib/sample-data"

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const author = popularAuthors.find((a) => a.id === id) || popularAuthors[0]

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
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-card-foreground">{author.name}</h1>
                {author.badge && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {author.badge}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-primary">{author.storiesCount}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>스토리</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-destructive">{author.totalLikes}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <Heart className="h-3 w-3" />
                    <span>좋아요</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-secondary">{author.totalTurns}</div>
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

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">좋아요한 이야기</h2>
          </div>
          <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
            <ProfileStoryList
              stories={likedStories}
              type="liked"
              emptyMessage="아직 좋아요한 이야기가 없습니다."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
