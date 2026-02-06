import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ParagraphCard } from "@/components/posts/ParagraphCard"
import { StoryActionBar } from "@/components/posts/StoryActionBar"
import { WritingEditor } from "@/components/posts/WritingEditor"
import { WritingGuide } from "@/components/posts/WritingGuide"
import { EpilogueSection } from "@/components/posts/EpilogueSection"
import { fetchStoryDetail } from "@/lib/queries/story"
import { fetchEpilogues, fetchEpilogueLikeStatuses } from "@/lib/queries/epilogue"
import { fetchTurnLikeStatuses, fetchStoryLikeStatus } from "@/lib/queries/likes"
import { createClient } from "@/lib/supabase/server"

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [storyResult, supabase] = await Promise.all([
    fetchStoryDetail(id),
    createClient(),
  ])
  const { story, createdBy } = storyResult

  if (!story) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const turnIds = story.paragraphs
    .map((p) => p.turnId)
    .filter((tid): tid is string => !!tid)
  const isCompleted = story.isCompleted ?? false
  const epilogues = isCompleted ? await fetchEpilogues(id) : []
  const [likedTurnIds, storyLiked, likedEpilogueIds] = await Promise.all([
    fetchTurnLikeStatuses(turnIds, user?.id ?? null),
    fetchStoryLikeStatus(id, user?.id ?? null),
    isCompleted
      ? fetchEpilogueLikeStatuses(epilogues.map((e) => e.id), user?.id ?? null)
      : Promise.resolve(new Set<string>()),
  ])

  const isLoggedIn = !!user
  const paragraphs = story.paragraphs

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={isCompleted ? "/completed" : "/"}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isCompleted ? "완성 작품 목록으로" : "목록으로 돌아가기"}</span>
        </Link>

        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {isCompleted && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 gap-1">
                <BookCheck className="h-3 w-3" />
                완성 작품
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary">{story.genre}</Badge>
            {story.tags?.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
            {story.title}
          </h1>
          <StoryActionBar
            roomId={story.id}
            title={story.title}
            paragraphs={paragraphs}
            likeCount={story.likes}
            isLiked={storyLiked}
            isChallenge={story.isChallenge}
            canComplete={!isCompleted && createdBy === user?.id}
          />
        </div>

        <div className="bg-card/40 backdrop-blur-sm rounded-3xl border border-border/50 p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">
            이야기 ({paragraphs.length}개의 턴)
          </h2>
          <div className="space-y-0">
            {paragraphs.map((paragraph) => (
              <ParagraphCard
                key={paragraph.turnId ?? paragraph.turnNumber}
                {...paragraph}
                isLiked={paragraph.turnId ? likedTurnIds.has(paragraph.turnId) : false}
              />
            ))}
          </div>
        </div>

        {isCompleted ? (
          <div className="mb-8">
            <EpilogueSection
              storyId={story.id}
              storyTitle={story.title}
              epilogues={epilogues}
              isLoggedIn={isLoggedIn}
              likedEpilogueIds={Array.from(likedEpilogueIds)}
            />
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">다음 턴 작성하기</h2>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="lg:flex-[2] min-w-0">
                <WritingEditor roomId={story.id} />
              </div>
              <div className="lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
                <WritingGuide roomId={story.id} genre={story.genre} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
