"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, BookOpen, Crown, Heart, Loader2, Medal, PenLine, Trophy } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PopularAuthor, RankingStory } from "@/lib/types"
import { cn } from "@/lib/utils"

type TimeRange = "weekly" | "monthly" | "all"
type RankingTab = "stories" | "authors"

const GENRE_FILTERS: { value: string; label: string }[] = [
  { value: "전체", label: "전체" },
  { value: "자유", label: "자유" },
  { value: "판타지", label: "판타지" },
  { value: "SF", label: "SF" },
  { value: "로맨스", label: "로맨스" },
  { value: "공포", label: "공포" },
]

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
  return (
    <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-semibold">
      {rank}
    </span>
  )
}

export default function RankingPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const [activeTab, setActiveTab] = useState<RankingTab>("stories")
  const [genreFilter, setGenreFilter] = useState<string>("전체")
  const [stories, setStories] = useState<RankingStory[]>([])
  const [authors, setAuthors] = useState<PopularAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authorsLoading, setAuthorsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    const params = new URLSearchParams({
      genre: genreFilter,
      timeRange,
    })
    fetch(`/api/ranking?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStories(data.stories ?? [])
      })
      .catch(() => {
        if (!cancelled) setStories([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [genreFilter, timeRange])

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "weekly", label: "주간" },
    { value: "monthly", label: "월간" },
    { value: "all", label: "전체" },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            인기 랭킹
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            가장 사랑받는 이야기와 작가
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            좋아요와 참여도를 기반으로 한 인기 스토리와 작가 랭킹입니다.
            매주 업데이트되는 랭킹에서 인기 작품을 만나보세요.
          </p>
        </div>

        {/* Tab: Stories / Authors */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-muted/50 rounded-xl">
            <Button
              variant={activeTab === "stories" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("stories")}
              className={cn(
                "rounded-lg px-6",
                activeTab !== "stories" && "text-muted-foreground"
              )}
            >
              스토리 랭킹
            </Button>
            <Button
              variant={activeTab === "authors" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("authors")}
              className={cn(
                "rounded-lg px-6",
                activeTab !== "authors" && "text-muted-foreground"
              )}
            >
              작가 랭킹
            </Button>
          </div>
        </div>

        {/* Time Range + Genre (스토리 랭킹일 때만) */}
        {activeTab === "stories" && (
          <div className="space-y-4 mb-8">
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-muted/50 rounded-xl">
                {timeRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={timeRange === range.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      "rounded-lg px-6",
                      timeRange !== range.value && "text-muted-foreground"
                    )}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {GENRE_FILTERS.map((g) => (
                <Button
                  key={g.value}
                  variant={genreFilter === g.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGenreFilter(g.value)}
                  className={cn(
                    "rounded-full",
                    genreFilter !== g.value && "text-muted-foreground"
                  )}
                >
                  {g.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Story Ranking List */}
        {activeTab === "stories" && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : stories.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>해당 장르의 랭킹이 없습니다.</p>
              </div>
            ) : (
              stories.map((story, index) => (
                <Link
                  key={story.id}
                  href={`/story/${story.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all",
                    index < 3 && "border-primary/20"
                  )}
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <RankIcon rank={index + 1} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-card-foreground truncate">
                        {story.title}
                      </h3>
                      <Badge variant="outline" className="flex-shrink-0">
                        {story.genre}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {story.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {story.turns}턴
                      </span>
                    </div>
                  </div>

                  {index < 3 && (
                    <div className="flex-shrink-0">
                      <Trophy
                        className={cn(
                          "h-5 w-5",
                          index === 0 && "text-yellow-500",
                          index === 1 && "text-gray-400",
                          index === 2 && "text-amber-600"
                        )}
                      />
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Author Ranking */}
        {activeTab === "authors" && (
          <div className="space-y-3">
            {authorsLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : authors.length === 0 ? (
              <div className="bg-card/40 rounded-2xl border border-dashed border-border p-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">아직 참여한 작가가 없어요</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  스토리에 참여하고 첫 번째로 랭킹에 올라가 보세요!
                </p>
                <Link href="/">
                  <Button variant="outline" className="mt-4">
                    스토리 보러 가기
                  </Button>
                </Link>
              </div>
            ) : (
              authors.map((author, index) => (
                <Link
                  key={author.id}
                  href={`/profile/${author.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all",
                    index < 3 && "border-primary/20"
                  )}
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <RankIcon rank={index + 1} />
                  </div>
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-card-foreground truncate">
                        {author.name}
                      </h3>
                      {author.badge && (
                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                          {author.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {author.storiesCount}스토리
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {author.totalLikes}
                      </span>
                      <span className="flex items-center gap-1">
                        <PenLine className="h-4 w-4" />
                        {author.totalTurns}턴
                      </span>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="flex-shrink-0">
                      <Trophy
                        className={cn(
                          "h-5 w-5",
                          index === 0 && "text-yellow-500",
                          index === 1 && "text-gray-400",
                          index === 2 && "text-amber-600"
                        )}
                      />
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        )}

        {/* Phase 2 Notice */}
        <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-dashed border-border text-center">
          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">더 많은 기능이 준비 중입니다</h3>
          <p className="text-sm text-muted-foreground">
            Phase 2에서 작가별 랭킹, 장르별 랭킹, 챌린지 수상작 전용 랭킹 등 더 다양한 랭킹 기능이 추가될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
