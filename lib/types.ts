// 공통 타입 정의
// DB 스키마 기반 + UI 컴포넌트 호환

// ============================================
// DB 스키마 타입 (Supabase 테이블 구조)
// ============================================

export interface DbProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  preferred_genres: string[]
  created_at: string
  updated_at: string
}

export interface DbChallenge {
  id: string
  title: string
  description: string | null
  theme: string | null
  start_at: string
  end_at: string
  status: "active" | "upcoming" | "ended"
  participants: number
  created_at: string
  updated_at: string
}

export interface DbStoryRoom {
  id: string
  title: string
  genre: string
  tags: string[]
  created_by: string | null
  preview: string | null
  cover_image: string | null
  challenge_id: string | null
  current_lock_user_id: string | null
  lock_expire_at: string | null
  like_count: number
  is_completed: boolean
  completed_at: string | null
  total_authors: number
  created_at: string
  updated_at: string
}

export interface DbStoryTurn {
  id: string
  room_id: string
  author_id: string
  content: string
  turn_index: number
  like_count: number
  created_at: string
}

export interface DbStoryLike {
  id: string
  room_id: string
  user_id: string
  created_at: string
}

export interface DbTurnLike {
  id: string
  turn_id: string
  user_id: string
  created_at: string
}

export interface DbChallengeStory {
  id: string
  challenge_id: string
  room_id: string
  created_at: string
}

export interface DbChallengeWinner {
  id: string
  challenge_id: string
  room_id: string
  rank: number
  created_at: string
}

export interface DbUserBadge {
  id: string
  user_id: string
  badge_type: string
  earned_at: string
}

export interface DbEpilogue {
  id: string
  room_id: string
  author_id: string
  content: string
  like_count: number
  created_at: string
}

// ============================================
// UI 컴포넌트용 타입 (기존 호환)
// ============================================

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
  isCompleted?: boolean
  coverImage?: string
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

export interface Paragraph {
  author: string
  authorId?: string
  authorAvatar?: string
  content: string
  turnNumber: number
  createdAt: string
  likes?: number
  turnId?: string
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

export interface Epilogue {
  id: string
  author: string
  authorId?: string
  authorAvatar?: string
  content: string
  createdAt: string
  likes?: number
}

// ============================================
// 랭킹 / 수상작 (UI 전용)
// ============================================

export interface RankingStory {
  id: string
  title: string
  genre: string
  likes: number
  turns: number
  rank: number
}

export interface AwardWinnerStory {
  id: string
  title: string
  author: string
  challengeName: string
  rank: number
  likes: number
  views?: number
  excerpt: string
}
