/**
 * DB ↔ UI 타입 매퍼
 * Db* 타입을 UI 컴포넌트용 타입으로 변환하는 순수 함수
 */

import type {
  DbStoryRoom,
  DbStoryTurn,
  DbProfile,
  DbChallenge,
  Story,
  CompletedStory,
  Paragraph,
  Challenge,
} from "@/lib/types"

/**
 * story_rooms → Story (진행 중 스토리)
 * genre는 DB값 그대로 사용 (자유/판타지/SF/로맨스/공포)
 */
export function mapRoomToStory(room: DbStoryRoom, turnCount: number): Story {
  return {
    id: room.id,
    title: room.title,
    genre: room.genre,
    tags: room.tags ?? [],
    likes: room.like_count,
    turns: turnCount,
    preview: room.preview ?? undefined,
    isChallenge: !!room.challenge_id,
    isCompleted: room.is_completed,
    coverImage: room.cover_image ?? undefined,
  }
}

/**
 * story_rooms → CompletedStory (완성 작품)
 * completed_at → completedDate
 * totalTurns는 story_turns count로 별도 조회 후 전달
 */
export function mapRoomToCompletedStory(
  room: DbStoryRoom,
  totalTurns?: number
): CompletedStory {
  return {
    id: room.id,
    title: room.title,
    genre: room.genre,
    tags: room.tags ?? [],
    totalTurns: totalTurns ?? 0,
    totalAuthors: room.total_authors,
    totalLikes: room.like_count,
    completedDate: room.completed_at ?? room.updated_at,
    preview: room.preview ?? "",
    coverImage: room.cover_image ?? undefined,
  }
}

/**
 * challenges → Challenge
 * start_at → startDate, end_at → endDate
 */
export function mapChallenge(
  challenge: DbChallenge,
  storiesCount: number
): Challenge {
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description ?? "",
    theme: challenge.theme ?? "자유",
    startDate: challenge.start_at.split("T")[0] ?? challenge.start_at,
    endDate: challenge.end_at.split("T")[0] ?? challenge.end_at,
    participants: challenge.participants ?? 0,
    stories: storiesCount,
    status: challenge.status,
  }
}

/**
 * story_turns + profiles → Paragraph
 * turn_index → turnNumber, author_id → authorId
 */
export function mapTurnToParagraph(
  turn: DbStoryTurn,
  profile: DbProfile | null
): Paragraph {
  const authorName = profile?.display_name?.trim() || "익명"
  return {
    author: authorName,
    authorId: turn.author_id,
    authorAvatar: profile?.avatar_url ?? undefined,
    content: turn.content,
    turnNumber: turn.turn_index,
    createdAt: turn.created_at,
    likes: turn.like_count,
    turnId: turn.id,
  }
}
