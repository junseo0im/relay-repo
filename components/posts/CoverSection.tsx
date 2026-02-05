"use client"

import { useState } from "react"
import { ImagePlus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CoverSectionProps {
  roomId: string
  coverImage?: string
  isCreator: boolean
}

export function CoverSection({
  roomId,
  coverImage: initialCoverImage,
  isCreator,
}: CoverSectionProps) {
  const [coverImage, setCoverImage] = useState(initialCoverImage)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (isLoading || !isCreator) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      const data = (await res.json()) as { success?: boolean; coverUrl?: string; error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? "표지 생성에 실패했습니다")
      }

      if (data.success && data.coverUrl) {
        setCoverImage(data.coverUrl)
        toast({
          title: "표지가 생성되었습니다",
          description: "AI가 이야기에 맞는 표지를 만들었어요.",
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "표지 생성에 실패했습니다"
      setError(msg)
      toast({
        variant: "destructive",
        title: "표지 생성 실패",
        description: msg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary/10">
          <ImagePlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">표지</h2>
          <p className="text-sm text-muted-foreground">
            AI가 이야기에 맞는 표지를 생성해요. 생성자만 표지를 만들 수 있어요.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div
          className={cn(
            "relative w-full sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-muted/30 flex-shrink-0",
            !coverImage && !isLoading && "flex items-center justify-center"
          )}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="flex flex-col items-center gap-2">
                <span className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">표지 생성 중...</span>
              </div>
            </div>
          ) : coverImage ? (
            <img
              src={coverImage}
              alt="표지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
              <ImagePlus className="h-10 w-10 opacity-50" />
              <span className="text-sm">표지 없음</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isCreator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  생성 중...
                </>
              ) : coverImage ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  표지 다시 생성
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  표지 생성
                </>
              )}
            </Button>
          )}
          {error && (
            <p className="mt-2 text-sm text-destructive">
              {error}
              {isCreator && (
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-2 underline hover:no-underline"
                >
                  닫기
                </button>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
