"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoryCard } from "@/components/story-card"
import { ArrowLeft, Heart, BookOpen, PenLine, Trophy, TrendingUp, Calendar, Sparkles } from "lucide-react"
import { popularAuthors } from "@/lib/sample-data"
import { sampleStories } from "@/lib/sample-data"

const badgeColors: Record<string, string> = {
  "전설 작가": "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 border-yellow-500/30",
  "베테랑 작가": "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-500/30",
  "인기 작가": "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-500/30",
}

export default function AuthorProfilePage() {
  const params = useParams()
  const authorId = params.id as string
  const [activeTab, setActiveTab] = useState("stories")

  // Find author from sample data
  const author = popularAuthors.find(a => a.id === authorId)

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">작가를 찾을 수 없습니다</h1>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Filter stories by this author (mock data)
  const authorStories = sampleStories.filter((_, index) => index % 3 === 0)
  const contributedStories = sampleStories.filter((_, index) => index % 3 === 1)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Glassmorphism */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/15 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-6 hover:bg-background/50 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
          </Link>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300" />
              <Avatar className="relative h-32 w-32 ring-4 ring-background">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                  {author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-foreground">{author.name}</h1>
                {author.badge && (
                  <Badge 
                    variant="outline" 
                    className={`${badgeColors[author.badge] || 'bg-muted'} text-sm px-4 py-1.5 flex items-center gap-2 w-fit`}
                  >
                    <Trophy className="h-4 w-4" />
                    {author.badge}
                  </Badge>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs">스토리</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{author.storiesCount}</div>
                </div>
                <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">총 좋아요</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{author.totalLikes.toLocaleString()}</div>
                </div>
                <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <PenLine className="h-4 w-4" />
                    <span className="text-xs">작성 턴</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{author.totalTurns}</div>
                </div>
                <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">평균 좋아요</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(author.totalLikes / author.totalTurns)}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-4 mb-4">
                <p className="text-muted-foreground leading-relaxed">
                  "{author.name}"님은 StoryRelay에서 활발히 활동하는 작가입니다. 
                  다양한 장르의 이야기에 참여하며 독자들에게 감동과 재미를 선사하고 있습니다.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  팔로우
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  활동 내역
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="stories" className="gap-2">
              <BookOpen className="h-4 w-4" />
              시작한 스토리
              <Badge variant="secondary" className="ml-1">{authorStories.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="contributions" className="gap-2">
              <PenLine className="h-4 w-4" />
              참여한 스토리
              <Badge variant="secondary" className="ml-1">{contributedStories.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-0">
            {authorStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorStories.map((story) => (
                  <StoryCard key={story.id} {...story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">아직 시작한 스토리가 없습니다</h3>
                <p className="text-muted-foreground">첫 번째 스토리를 만들어보세요!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contributions" className="mt-0">
            {contributedStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contributedStories.map((story) => (
                  <StoryCard key={story.id} {...story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50">
                <PenLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">아직 참여한 스토리가 없습니다</h3>
                <p className="text-muted-foreground">다른 작가들의 이야기에 참여해보세요!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Achievement Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border border-border/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">획득한 배지</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { name: "첫 스토리", icon: "🎯", description: "첫 번째 스토리 생성" },
              { name: "작가 데뷔", icon: "✍️", description: "10개 턴 작성" },
              { name: "인기 작가", icon: "⭐", description: "100 좋아요 달성" },
              { name: "베스트셀러", icon: "📚", description: "좋아요 500 달성" },
            ].map((badge) => (
              <div
                key={badge.name}
                className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4 text-center hover:border-primary/30 hover:scale-105 transition-all"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="font-semibold text-foreground text-sm mb-1">{badge.name}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
