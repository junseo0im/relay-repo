"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BookCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GENRE_COLORS } from "@/lib/types"
import type { CompletedStory } from "@/lib/types"

const ITEMS_PER_PAGE = 9

const genres = [
  { value: "all", label: "전체 장르" },
  { value: "free", label: "자유" },
  { value: "fantasy", label: "판타지" },
  { value: "sf", label: "SF" },
  { value: "romance", label: "로맨스" },
  { value: "horror", label: "공포" },
]

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "likes", label: "인기순" },
  { value: "turns", label: "긴 이야기순" },
  { value: "authors", label: "많은 참여자순" },
]

export default function CompletedPage() {
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("all")
  const [sort, setSort] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [stories, setStories] = useState<CompletedStory[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch(
      `/api/completed?genre=${genre}&search=${encodeURIComponent(search)}&sort=${sort}&page=${currentPage}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data: { stories: CompletedStory[]; totalCount: number }) => {
        setStories(data.stories ?? [])
        setTotalCount(data.totalCount ?? 0)
      })
      .catch(() => {
        setStories([])
        setTotalCount(0)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [genre, search, sort, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, genre, sort])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen pt-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm">
              <BookCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">완성 작품</h1>
              <p className="text-muted-foreground mt-1">함께 완성한 아름다운 이야기들</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{totalCount}개의 완성 작품</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{stories.reduce((sum, s) => sum + s.totalLikes, 0).toLocaleString()} 좋아요</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative bg-background/40 backdrop-blur-xl rounded-3xl border border-border/50 p-4 md:p-6 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none rounded-3xl" />

          <div className="relative">
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((g) => (
                <Button
                  key={g.value}
                  variant={genre === g.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGenre(g.value)}
                  className={
                    genre === g.value
                      ? "rounded-full shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-secondary transition-all duration-300 hover:scale-105"
                      : "rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                  }
                >
                  {g.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="제목이나 태그로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-border/50 hover:border-primary/30 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">완성 작품을 불러오는 중...</p>
          </div>
        ) : stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link key={story.id} href={`/story/${story.id}`}>
                  <div className="group relative bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                    {story.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                        <Badge
                          className={`absolute top-3 left-3 ${GENRE_COLORS[story.genre] || GENRE_COLORS["자유"]}`}
                        >
                          {story.genre}
                        </Badge>
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {story.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {story.preview}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {story.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{story.totalTurns}</div>
                          <div className="text-xs text-muted-foreground">턴</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-secondary">{story.totalAuthors}</div>
                          <div className="text-xs text-muted-foreground">작가</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-destructive">{story.totalLikes}</div>
                          <div className="text-xs text-muted-foreground">좋아요</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {story.completedDate
                            ? new Date(story.completedDate).toLocaleDateString("ko-KR")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-card/60 backdrop-blur-sm disabled:opacity-50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">이전 페이지</span>
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)

                    if (!showPage) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <div key={page} className="px-2 py-1 text-muted-foreground">
                            ...
                          </div>
                        )
                      }
                      return null
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "min-w-[40px] shadow-md shadow-primary/25"
                            : "min-w-[40px] bg-card/60 backdrop-blur-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-card/60 backdrop-blur-sm disabled:opacity-50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">다음 페이지</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-6 rounded-full bg-muted/50 mb-4">
              <BookCheck className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">완성 작품이 없습니다</h3>
            <p className="text-muted-foreground text-center max-w-md">
              아직 완성된 스토리가 없어요. 스토리를 만들고 완성하기 버튼을 눌러보세요!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
