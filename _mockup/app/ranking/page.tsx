"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Heart, BookOpen, Crown, Medal, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

type TimeRange = "weekly" | "monthly" | "all"

// Sample ranking data
const rankingData = [
  {
    rank: 1,
    id: "3",
    title: "우연히, 카페에서",
    genre: "로맨스",
    likes: 312,
    turns: 23,
  },
  {
    rank: 2,
    id: "5",
    title: "할머니의 비밀 레시피",
    genre: "자유",
    likes: 278,
    turns: 18,
  },
  {
    rank: 3,
    id: "1",
    title: "별빛 아래에서 시작된 여정",
    genre: "판타지",
    likes: 234,
    turns: 15,
  },
  {
    rank: 4,
    id: "6",
    title: "용의 심장을 가진 기사",
    genre: "판타지",
    likes: 203,
    turns: 21,
  },
  {
    rank: 5,
    id: "2",
    title: "2087년, 서울의 마지막 날",
    genre: "SF",
    likes: 189,
    turns: 12,
  },
  {
    rank: 6,
    id: "4",
    title: "13층에서 들리는 소리",
    genre: "공포",
    likes: 156,
    turns: 8,
  },
  {
    rank: 7,
    id: "7",
    title: "시간 여행자의 일기",
    genre: "SF",
    likes: 145,
    turns: 14,
  },
  {
    rank: 8,
    id: "8",
    title: "잃어버린 왕국의 열쇠",
    genre: "판타지",
    likes: 132,
    turns: 19,
  },
  {
    rank: 9,
    id: "9",
    title: "비 오는 날의 고백",
    genre: "로맨스",
    likes: 128,
    turns: 11,
  },
  {
    rank: 10,
    id: "10",
    title: "밤의 도서관",
    genre: "미스터리",
    likes: 119,
    turns: 16,
  },
]

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
  return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-semibold">{rank}</span>
}

export default function RankingPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly")

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
            Phase 2 기능
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            인기 이야기 랭킹
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            가장 많은 사랑을 받은 이야기들을 확인해보세요.
            매주 업데이트되는 랭킹에서 인기 작품을 만나보세요.
          </p>
        </div>

        {/* Time Range Tabs */}
        <div className="flex justify-center mb-8">
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

        {/* Ranking List */}
        <div className="space-y-3">
          {rankingData.map((story, index) => (
            <Link
              key={story.id}
              href={`/story/${story.id}`}
              className={cn(
                "flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all",
                index < 3 && "border-primary/20"
              )}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <RankIcon rank={story.rank} />
              </div>

              {/* Info */}
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

              {/* Trophy for top 3 */}
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
          ))}
        </div>

        {/* Phase 2 Notice */}
        <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-dashed border-border text-center">
          <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">더 많은 기능이 준비 중입니다</h3>
          <p className="text-sm text-muted-foreground">
            Phase 2에서 작가별 랭킹, 장르별 랭킹, 챌린지 수상작 등 더 다양한 랭킹 기능이 추가될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
