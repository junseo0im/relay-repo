import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  fetchChallengeById,
  fetchChallengeStories,
} from "@/lib/queries/challenge"
import { cn } from "@/lib/utils"

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [challenge, challengeStories] = await Promise.all([
    fetchChallengeById(id),
    fetchChallengeStories(id),
  ])

  if (!challenge) {
    return (
      <div className="min-h-screen py-12 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">챌린지를 찾을 수 없습니다</h1>
        <Link href="/challenges">
          <Button variant="outline">챌린지 목록으로</Button>
        </Link>
      </div>
    )
  }

  const statusConfig = {
    active: { label: "진행 중", className: "bg-primary/10 text-primary" },
    upcoming: { label: "예정됨", className: "bg-secondary/50 text-secondary-foreground" },
    ended: { label: "종료됨", className: "bg-muted text-muted-foreground" },
  }
  const config = statusConfig[challenge.status]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>챌린지 목록으로</span>
        </Link>

        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <Badge className={config.className}>{config.label}</Badge>
            <Badge variant="outline">{challenge.theme}</Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
            {challenge.title}
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">{challenge.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {challenge.startDate} ~ {challenge.endDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{challenge.participants}명 참여</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{challenge.stories}개 스토리</span>
            </div>
          </div>

          {challenge.status === "ended" && challenge.stories > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-700">우수작 배지 수여 완료</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                수상작 갤러리에서 우승작을 확인해보세요.
              </p>
            </div>
          )}
        </div>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {challenge.status === "active"
              ? "참여 스토리"
              : challenge.status === "upcoming"
                ? "예정된 챌린지"
                : "참여했던 스토리"}
          </h2>

          {challenge.status === "upcoming" ? (
            <div className="bg-card/40 rounded-2xl border border-dashed border-border p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                이 챌린지는 {challenge.startDate}에 시작됩니다.
              </p>
              <p className="text-sm text-muted-foreground">
                알림을 받으시려면 로그인 후 관심 챌린지로 등록해주세요.
              </p>
            </div>
          ) : challengeStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challengeStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.id}`}
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-2xl border border-border/50 bg-card",
                    "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {story.genre}
                    </Badge>
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                      {story.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {story.preview ?? ""}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{story.turns}턴</span>
                      <span>❤ {story.likes}</span>
                    </div>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card/40 rounded-2xl border border-dashed border-border p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">아직 참여 스토리가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-1">
                첫 번째로 이 챌린지에 참여해보세요!
              </p>
              <Link href="/story/create" className="mt-4 inline-block">
                <Button>새 스토리 만들기</Button>
              </Link>
            </div>
          )}
        </section>

        {challenge.status === "ended" && (
          <div className="mt-8 text-center">
            <Link href="/challenges#award-winners">
              <Button variant="outline" className="gap-2">
                <Trophy className="h-4 w-4" />
                수상작 갤러리 보기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
