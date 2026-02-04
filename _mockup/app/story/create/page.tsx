"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Plus, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const genres = [
  { value: "free", label: "자유" },
  { value: "fantasy", label: "판타지" },
  { value: "sf", label: "SF" },
  { value: "romance", label: "로맨스" },
  { value: "horror", label: "공포" },
  { value: "mystery", label: "미스터리" },
  { value: "comedy", label: "코미디" },
]

const presetTags = [
  "힐링", "반전", "감동", "스릴러", "액션", 
  "일상", "판타지", "미래", "과거", "현대",
  "학원", "직장", "가족", "우정", "사랑"
]

export default function CreateStoryPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState("")
  const [firstParagraph, setFirstParagraph] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim()) && tags.length < 5) {
      setTags([...tags, customTag.trim()])
      setCustomTag("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 여기에 실제 API 호출 로직 추가
    // await createStory({ title, genre, firstParagraph, tags })
    
    // 임시로 2초 후 스토리 목록으로 리디렉션
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  const isFormValid = title.trim() && genre && firstParagraph.trim() && tags.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">새 스토리 만들기</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                당신의 상상력으로 새로운 이야기를 시작하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Story Title */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all">
            <Label htmlFor="title" className="text-base font-semibold mb-3 block">
              스토리 제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="매력적인 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="text-lg"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              {title.length}/100자
            </p>
          </div>

          {/* Genre Selection */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all">
            <Label htmlFor="genre" className="text-base font-semibold mb-3 block">
              장르 선택 <span className="text-destructive">*</span>
            </Label>
            <Select value={genre} onValueChange={setGenre} required>
              <SelectTrigger id="genre">
                <SelectValue placeholder="장르를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* First Paragraph */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all">
            <Label htmlFor="firstParagraph" className="text-base font-semibold mb-3 block">
              첫 번째 문단 <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              이야기의 시작을 작성하세요. 다른 작가들이 이어서 쓸 수 있도록 흥미로운 설정이나 상황을 만들어보세요.
            </p>
            <Textarea
              id="firstParagraph"
              placeholder="옛날 옛적에... 또는 당신만의 방식으로 이야기를 시작하세요."
              value={firstParagraph}
              onChange={(e) => setFirstParagraph(e.target.value)}
              rows={8}
              maxLength={1000}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              {firstParagraph.length}/1000자 (권장: 200-500자)
            </p>
          </div>

          {/* Tags */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all">
            <Label className="text-base font-semibold mb-3 block">
              태그 <span className="text-destructive">*</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (최소 1개, 최대 5개)
              </span>
            </Label>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-muted/30">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-3 pr-2 py-1.5 gap-1 hover:bg-destructive/10 transition-colors"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Preset Tags */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">추천 태그</p>
              <div className="flex flex-wrap gap-2">
                {presetTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    disabled={tags.includes(tag) || tags.length >= 5}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-all",
                      tags.includes(tag)
                        ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                        : "bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary border-border"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">직접 입력</p>
              <div className="flex gap-2">
                <Input
                  placeholder="태그 입력 (예: 힐링)"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCustomTag()
                    }
                  }}
                  maxLength={10}
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim() || tags.length >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end sticky bottom-4">
            <Link href="/" className="flex-1 sm:flex-none">
              <Button type="button" variant="outline" size="lg" className="w-full">
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 sm:flex-none gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  스토리 생성하기
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
