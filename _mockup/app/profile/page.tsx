"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ProfileStoryList } from "@/components/profile-story-list"
import { PenLine, Heart, Clock, Settings, BookOpen } from "lucide-react"
import { participatedStories, likedStories } from "@/lib/sample-data"

export default function ProfilePage() {
  const { user, isLoggedIn, setShowLoginModal } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      router.push("/")
    }
  }, [isLoggedIn, router, setShowLoginModal])

  if (!isLoggedIn || !user) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-card-foreground mb-1">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{user.email}</p>
              
              {/* Stats */}
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

              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                프로필 설정
              </Button>
            </div>
          </div>
        </div>

        {/* Participated Stories */}
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

        {/* Liked Stories */}
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

        {/* Phase 2 Placeholder - Pending Turns */}
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
  )
}
