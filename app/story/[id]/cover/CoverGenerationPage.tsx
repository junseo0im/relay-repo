"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImagePlus, Loader2, BookCheck, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CoverGenerationPageProps {
  roomId: string
  title: string
  genre: string
  initialCoverImage?: string
}

export function CoverGenerationPage({
  roomId,
  title,
  genre,
  initialCoverImage,
}: CoverGenerationPageProps) {
  const router = useRouter()
  const [coverImage, setCoverImage] = useState<string | null>(initialCoverImage ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      const data = (await res.json()) as {
        success?: boolean
        coverUrl?: string
        error?: string
        detail?: string
      }

      if (res.ok && data.success && data.coverUrl) {
        setCoverImage(data.coverUrl)
      } else {
        const msg = data.error ?? "표지 생성에 실패했습니다"
        setError(data.detail ? `${msg} (${data.detail})` : msg)
      }
    } catch {
      setError("표지 생성 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/completed")
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            표지 만들기
          </h1>
          <p className="text-muted-foreground">
            AI가 &quot;{title}&quot;에 맞는 표지를 생성해요
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-8 shadow-sm">
          <div
            className={`relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-muted/30 mb-6 ${
              !coverImage && !isLoading ? "flex items-center justify-center" : ""
            }`}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  AI가 표지를 그리고 있어요...
                </p>
                <p className="text-xs text-muted-foreground/80">
                  최대 1분 정도 걸릴 수 있어요
                </p>
              </div>
            ) : coverImage ? (
              <img
                src={coverImage}
                alt={`${title} 표지`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
                <ImagePlus className="h-16 w-16 opacity-50" />
                <span className="text-sm">표지가 생성되지 않았어요</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {coverImage ? (
              <Link href="/completed" className="flex-1">
                <Button size="lg" className="w-full gap-2">
                  <BookCheck className="h-5 w-5" />
                  완성 작품 보기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      표지 생성
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex-1"
                >
                  나중에 하기
                </Button>
              </>
            )}
          </div>

          {coverImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-3 w-full text-muted-foreground"
            >
              표지 다시 생성
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          HUGGINGFACE_TOKEN이 설정되어 있어야 표지 생성이 가능해요
        </p>
      </div>
    </div>
  )
}
