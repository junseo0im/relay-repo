// 공통 타입 정의

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

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

export interface Paragraph {
  author: string
  authorId?: string
  authorAvatar?: string
  content: string
  turnNumber: number
  createdAt: string
  likes?: number
}

export interface StoryDetail extends Story {
  paragraphs: Paragraph[]
}

export interface ProfileStory {
  id: string
  title: string
  genre: string
  likes: number
  turns: number
  myTurns?: number
  lastActivity: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  theme: string
  startDate: string
  endDate: string
  participants: number
  stories: number
  status: "active" | "upcoming" | "ended"
}

export interface CompletedStory {
  id: string
  title: string
  genre: string
  tags: string[]
  totalTurns: number
  totalAuthors: number
  totalLikes: number
  completedDate: string
  preview: string
  coverImage?: string
}

export type Genre = "전체" | "자유" | "판타지" | "SF" | "로맨스" | "공포"

export const GENRES: Genre[] = ["전체", "자유", "판타지", "SF", "로맨스", "공포"]

export const GENRE_COLORS: Record<string, string> = {
  "자유": "bg-muted text-muted-foreground",
  "판타지": "bg-primary/10 text-primary",
  "SF": "bg-secondary/50 text-secondary-foreground",
  "로맨스": "bg-destructive/10 text-destructive",
  "공포": "bg-foreground/10 text-foreground",
}
