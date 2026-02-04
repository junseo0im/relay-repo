"use client"

import React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Heart, PenLine, BookOpen } from "lucide-react"
import { GENRE_COLORS, type Story } from "@/lib/types"

type StoryCardProps = Pick<Story, "id" | "title" | "genre" | "tags" | "likes" | "turns" | "preview">

export function StoryCard({ id, title, genre, tags, likes, turns, preview }: StoryCardProps) {
  const { isLoggedIn, setShowLoginModal } = useAuth()

  const handleContinueClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      setShowLoginModal(true)
    }
  }

  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300 pointer-events-none" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Badge className={`${GENRE_COLORS[genre] || GENRE_COLORS["자유"]} transition-transform group-hover:scale-105`}>
            {genre}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-sm group-hover:text-primary transition-colors">
            <Heart className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`좋아요 ${likes}개`}>{likes}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/story/${id}`}>
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {title}
          </h3>
        </Link>

        {/* Preview */}
        {preview && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {preview}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 group-hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{turns}개의 턴</span>
          </div>
          {isLoggedIn ? (
            <Link href={`/story/${id}`}>
              <Button size="sm" variant="ghost" className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 transition-all">
                <PenLine className="h-4 w-4" aria-hidden="true" />
                이야기 이어쓰기
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 transition-all"
              onClick={handleContinueClick}
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              이야기 이어쓰기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
