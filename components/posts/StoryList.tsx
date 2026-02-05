"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, FileX, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StoryCard } from "@/components/posts/StoryCard"
import type { HomeFilters } from "@/components/posts/FilterBar"
import type { Story } from "@/lib/types"

const ITEMS_PER_PAGE = 9

interface StoryListProps {
  filters: HomeFilters
}

export function StoryList({ filters }: StoryListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [stories, setStories] = useState<Story[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.genre, filters.search, filters.sort])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const params = new URLSearchParams({
      genre: filters.genre,
      search: filters.search,
      sort: filters.sort,
      page: String(currentPage),
    })

    fetch(`/api/stories?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories ?? [])
          setTotalCount(data.totalCount ?? 0)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStories([])
          setTotalCount(0)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters.genre, filters.search, filters.sort, currentPage])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  const currentStories = stories

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">진행 중인 이야기</h2>
        <span className="text-sm text-muted-foreground">
          {totalCount}개의 이야기
        </span>
      </div>

      {isLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : currentStories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentStories.map((story) => (
              <StoryCard key={story.id} {...story} />
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
            <FileX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">검색 결과가 없습니다</h3>
          <p className="text-muted-foreground text-center max-w-md">
            다른 검색어나 필터를 사용해보세요
          </p>
        </div>
      )}
    </section>
  )
}

