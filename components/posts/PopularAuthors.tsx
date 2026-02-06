"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { BookOpen, Heart, PenLine, Search, Sparkles } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import type { PopularAuthor } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const badgeColors: Record<string, string> = {
  "전설 작가":
    "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 border-yellow-500/30",
  "베테랑 작가":
    "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-500/30",
  "인기 작가":
    "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-500/30",
}

interface PopularAuthorsProps {
  authors: PopularAuthor[]
}

export function PopularAuthors({ authors }: PopularAuthorsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAuthors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return authors
    return authors.filter((author) => author.name.toLowerCase().includes(q))
  }, [searchQuery, authors])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground">인기 작가</h2>
          </div>
          <p className="text-muted-foreground">스토리릴레이를 이끌어가는 멋진 작가들을 만나보세요</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="작가 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/60 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author, index) => (
          <div
            key={author.id}
            className="group relative bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300 rounded-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {author.name}
                    </h3>
                    {author.badge && (
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${badgeColors[author.badge] || "bg-muted"}`}
                      >
                        {author.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors">
                  <div className="text-lg font-bold text-foreground">{author.storiesCount}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>스토리</span>
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors">
                  <div className="text-lg font-bold text-foreground">{author.totalLikes}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>좋아요</span>
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 group-hover:bg-primary/5 transition-colors">
                  <div className="text-lg font-bold text-foreground">{author.totalTurns}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <PenLine className="h-3 w-3" />
                    <span>턴</span>
                  </div>
                </div>
              </div>

              <Link href={`/profile/${author.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  프로필 보기
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredAuthors.length === 0 && (
        <EmptyState
          icon={<Search className="h-12 w-12 text-muted-foreground" />}
          title="작가를 찾을 수 없습니다"
          description="다른 검색어를 입력해보세요"
        />
      )}
    </section>
  )
}

