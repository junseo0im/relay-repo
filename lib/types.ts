// 공통 타입 정의 (mockup 기반)

export interface PopularAuthor {
  id: string
  name: string
  avatar?: string
  storiesCount: number
  totalLikes: number
  totalTurns: number
  badge?: string
}

export interface Story {
  id: string
  title: string
  genre: string
  tags: string[]
  likes: number
  turns: number
  preview?: string
  isChallenge?: boolean
}

export type Genre = "전체" | "자유" | "판타지" | "SF" | "로맨스" | "공포"

export const GENRES: Genre[] = ["전체", "자유", "판타지", "SF", "로맨스", "공포"]

export const GENRE_COLORS: Record<string, string> = {
  자유: "bg-muted text-muted-foreground",
  판타지: "bg-primary/10 text-primary",
  SF: "bg-secondary/50 text-secondary-foreground",
  로맨스: "bg-destructive/10 text-destructive",
  공포: "bg-foreground/10 text-foreground",
}

