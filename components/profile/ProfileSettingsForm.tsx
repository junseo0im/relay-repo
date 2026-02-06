"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, Save, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/actions/profile"
import { useToast } from "@/hooks/use-toast"
import { GENRES } from "@/lib/types"
import { cn } from "@/lib/utils"

const GENRE_OPTIONS = GENRES.filter((g) => g !== "전체")

interface ProfileSettingsFormProps {
  initialDisplayName: string
  initialAvatarUrl: string
  initialBio: string
  initialPreferredGenres: string[]
}

export function ProfileSettingsForm({
  initialDisplayName,
  initialAvatarUrl,
  initialBio,
  initialPreferredGenres,
}: ProfileSettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [bio, setBio] = useState(initialBio)
  const [preferredGenres, setPreferredGenres] = useState<string[]>(
    initialPreferredGenres.filter((g) =>
      (GENRE_OPTIONS as readonly string[]).includes(g)
    )
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const toggleGenre = (genre: string) => {
    setPreferredGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateProfile({
      displayName: displayName.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      bio: bio.trim() || undefined,
      preferredGenres,
    })
    setIsSaving(false)

    if (result.success) {
      toast({ title: "프로필이 저장되었습니다" })
    } else {
      toast({ variant: "destructive", title: result.error })
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>프로필로 돌아가기</span>
        </Link>

        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-2">
            <User className="h-6 w-6" />
            프로필 설정
          </h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-semibold">프로필 사진</Label>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="이미지 URL을 입력하세요"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    프로필에 표시될 이미지 URL을 입력하세요.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base font-semibold">
                표시 이름
              </Label>
              <Input
                id="displayName"
                placeholder="다른 사용자에게 보일 이름"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
                maxLength={20}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">{displayName.length}/20자</p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">선호 장르</Label>
              <p className="text-sm text-muted-foreground">
                관심 있는 장르를 선택하세요. (최대 5개)
              </p>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    disabled={
                      !preferredGenres.includes(genre) && preferredGenres.length >= 5
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50",
                      preferredGenres.includes(genre)
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                선택됨: {preferredGenres.join(", ") || "없음"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-semibold">
                한 줄 소개
              </Label>
              <Textarea
                id="bio"
                placeholder="나를 소개하는 짧은 문장을 적어보세요 (선택)"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                rows={3}
                maxLength={150}
                className="resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground">{bio.length}/150자</p>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    설정 저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
