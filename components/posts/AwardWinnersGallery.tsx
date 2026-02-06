"use client"

import Link from "next/link"
import { Award, Heart, Medal, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AwardWinnerStory } from "@/lib/queries/challenge"

interface AwardWinnersGalleryProps {
  winnerStories: AwardWinnerStory[]
}

const rankConfig = {
  1: {
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-gradient-to-br from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/50",
    label: "1위",
  },
  2: {
    icon: Medal,
    color: "text-gray-500",
    bgColor: "bg-gradient-to-br from-gray-400/20 to-gray-500/20",
    borderColor: "border-gray-400/50",
    label: "2위",
  },
  3: {
    icon: Award,
    color: "text-amber-700",
    bgColor: "bg-gradient-to-br from-amber-600/20 to-amber-700/20",
    borderColor: "border-amber-600/50",
    label: "3위",
  },
}

export function AwardWinnersGallery({ winnerStories }: AwardWinnersGalleryProps) {
  const topWinners = winnerStories.filter((w) => w.rank <= 3)

  if (topWinners.length === 0) return null

  return (
    <section id="award-winners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
          <Trophy className="h-4 w-4 text-yellow-600 animate-pulse" />
          <span className="text-sm font-medium text-yellow-700">명예의 전당</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">수상작 갤러리</h2>
        <p className="text-muted-foreground">
          뛰어난 이야기로 많은 사랑을 받은 챌린지 우승작들을 만나보세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {winnerStories.map((story, index) => {
          const config = rankConfig[story.rank as keyof typeof rankConfig]
          const RankIcon = config.icon

          return (
            <div
              key={story.id}
              className="group relative bg-card rounded-3xl border-2 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              style={{
                borderColor: `var(--${story.rank === 1 ? "yellow" : story.rank === 2 ? "gray" : "amber"}-500)`,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div
                className={`absolute inset-0 ${config.bgColor} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
              />

              <div className="absolute top-4 right-4 z-10">
                <div
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${config.bgColor} border-2 ${config.borderColor} backdrop-blur-sm shadow-lg`}
                >
                  <RankIcon className={`h-5 w-5 ${config.color}`} />
                  <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                </div>
              </div>

              <div className="relative p-6 pt-16">
                <div
                  className={`inline-flex p-4 rounded-2xl ${config.bgColor} border ${config.borderColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <RankIcon className={`h-8 w-8 ${config.color}`} />
                </div>

                <div className="mb-4">
                  <Badge variant="outline" className="mb-3 bg-background/50 backdrop-blur-sm">
                    {story.challengeName}
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    by <span className="font-medium text-foreground">{story.author}</span>
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
                    "{story.excerpt}"
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-destructive" />
                    <span>{story.likes}</span>
                  </div>
                </div>

                <Link href={`/story/${story.id}`}>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg group-hover:shadow-xl transition-all">
                    작품 읽기
                  </Button>
                </Link>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>
          )
        })}
      </div>
    </section>
  )
}
