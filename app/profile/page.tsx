"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Clock, Heart, PenLine, Settings, User } from "lucide-react"

import { RequireAuth } from "@/components/auth/RequireAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProfileStoryList } from "@/components/posts/ProfileStoryList"
import { useAuth } from "@/components/providers/AuthProvider"
import { likedStories, participatedStories } from "@/lib/sample-data"

function loadProfileSettings() {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("profile-settings")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [localOverrides, setLocalOverrides] = useState({
    displayName: "",
    avatarUrl: "",
    preferredGenres: [] as string[],
  })

  useEffect(() => {
    const stored = loadProfileSettings()
    if (stored) {
      setLocalOverrides({
        displayName: stored.displayName ?? "",
        avatarUrl: stored.avatarUrl ?? "",
        preferredGenres: stored.preferredGenres ?? [],
      })
    }
  }, [])

  const user = {
    name: (localOverrides.displayName || authUser?.name) ?? "사용자",
    email: authUser?.email ?? "user@example.com",
    avatarUrl: (localOverrides.avatarUrl || authUser?.avatar) ?? "",
    preferredGenres: localOverrides.preferredGenres,
  }

  return (
    <RequireAuth>
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-card-foreground mb-1">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{user.email}</p>

              {user.preferredGenres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">선호 장르:</span>
                  {user.preferredGenres.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                  <PenLine className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {participatedStories.reduce((acc, s) => acc + (s.myTurns || 0), 0)}개 턴 작성
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {participatedStories.length}개 이야기 참여
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {likedStories.length}개 좋아요
                  </span>
                </div>
              </div>

              <Link href="/profile/settings" className="inline-block">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  프로필 설정
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">내가 참여한 이야기</h2>
          </div>
          <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
            <ProfileStoryList
              stories={participatedStories}
              type="participated"
              emptyMessage="아직 참여한 이야기가 없습니다. 첫 번째 이야기에 참여해보세요!"
            />
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">좋아요한 이야기</h2>
          </div>
          <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
            <ProfileStoryList
              stories={likedStories}
              type="liked"
              emptyMessage="아직 좋아요한 이야기가 없습니다. 마음에 드는 이야기에 좋아요를 눌러보세요!"
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">승인 대기 중인 턴</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Phase 2
            </span>
          </div>
          <div className="bg-card/30 rounded-2xl border border-dashed border-border p-8 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Phase 2에서 제공될 예정입니다.
              <br />
              작성한 턴의 승인 상태를 확인할 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </div>
    </RequireAuth>
  )
}
