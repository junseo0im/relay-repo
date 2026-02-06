/**
 * 프로필 조회
 * profiles + story_turns(참여) + story_likes(좋아요) + turn likes(받은 좋아요)
 */

import { createClient } from "@/lib/supabase/server"
import type { ProfileStory } from "@/lib/types"
import type { DbStoryRoom, DbStoryTurn } from "@/lib/types"

function formatLastActivity(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

export interface MyProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  email?: string
  bio: string | null
  preferredGenres: string[]
  totalTurns: number
  participatedCount: number
  likedCount: number
  receivedLikes: number
}

export async function fetchMyProfile(userId: string): Promise<MyProfile | null> {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, preferred_genres")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    return null
  }

  const [turnsData, likesData, turnLikesData] = await Promise.all([
    supabase.from("story_turns").select("room_id, like_count").eq("author_id", userId),
    supabase.from("story_likes").select("room_id").eq("user_id", userId),
    supabase.from("story_turns").select("like_count").eq("author_id", userId),
  ])

  const totalTurns = (turnsData.data ?? []).length
  const participatedRoomIds = [...new Set((turnsData.data ?? []).map((t) => t.room_id))]
  const likedCount = (likesData.data ?? []).length
  const receivedLikes = (turnLikesData.data ?? []).reduce((acc, t) => acc + (t.like_count ?? 0), 0)

  return {
    id: profile.id,
    displayName: profile.display_name?.trim() || "사용자",
    avatarUrl: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
    preferredGenres: profile.preferred_genres ?? [],
    totalTurns,
    participatedCount: participatedRoomIds.length,
    likedCount,
    receivedLikes,
  }
}

export async function fetchParticipatedStories(
  userId: string
): Promise<ProfileStory[]> {
  const supabase = await createClient()

  const { data: turns, error: turnsError } = await supabase
    .from("story_turns")
    .select("room_id, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })

  if (turnsError || !turns?.length) return []

  const roomIds = [...new Set((turns as { room_id: string }[]).map((t) => t.room_id))]
  const myTurnsByRoom: Record<string, number> = {}
  const lastTurnByRoom: Record<string, string> = {}
  for (const t of turns as { room_id: string; created_at: string }[]) {
    myTurnsByRoom[t.room_id] = (myTurnsByRoom[t.room_id] ?? 0) + 1
    if (!lastTurnByRoom[t.room_id]) lastTurnByRoom[t.room_id] = t.created_at
  }

  const { data: rooms, error: roomsError } = await supabase
    .from("story_rooms")
    .select("id, title, genre, like_count, updated_at")
    .in("id", roomIds)

  if (roomsError || !rooms?.length) return []

  const turnCounts: Record<string, number> = {}
  const { data: allTurns } = await supabase
    .from("story_turns")
    .select("room_id")
    .in("room_id", roomIds)
  for (const t of allTurns ?? []) {
    turnCounts[t.room_id] = (turnCounts[t.room_id] ?? 0) + 1
  }

  return (rooms as DbStoryRoom[]).map((r) => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    likes: r.like_count ?? 0,
    turns: turnCounts[r.id] ?? 0,
    myTurns: myTurnsByRoom[r.id] ?? 0,
    lastActivity: formatLastActivity(lastTurnByRoom[r.id] ?? r.updated_at ?? r.id),
  }))
}

export async function fetchLikedStories(userId: string): Promise<ProfileStory[]> {
  const supabase = await createClient()

  const { data: likes, error: likesError } = await supabase
    .from("story_likes")
    .select("room_id")
    .eq("user_id", userId)

  if (likesError || !likes?.length) return []

  const roomIds = (likes as { room_id: string }[]).map((l) => l.room_id)

  const { data: rooms, error: roomsError } = await supabase
    .from("story_rooms")
    .select("id, title, genre, like_count, updated_at, created_at")
    .in("id", roomIds)
    .order("updated_at", { ascending: false })

  if (roomsError || !rooms?.length) return []

  const turnCounts: Record<string, number> = {}
  const { data: allTurns } = await supabase
    .from("story_turns")
    .select("room_id")
    .in("room_id", roomIds)
  for (const t of allTurns ?? []) {
    turnCounts[t.room_id] = (turnCounts[t.room_id] ?? 0) + 1
  }

  return (rooms as DbStoryRoom[]).map((r) => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    likes: r.like_count ?? 0,
    turns: turnCounts[r.id] ?? 0,
    lastActivity: formatLastActivity(r.updated_at ?? r.created_at ?? r.id),
  }))
}

// --- 타인 프로필 (작가 프로필) ---

export interface AuthorProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  preferredGenres: string[]
  storiesCount: number
  totalLikes: number
  totalTurns: number
}

export async function fetchAuthorProfile(
  authorId: string
): Promise<AuthorProfile | null> {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, preferred_genres")
    .eq("id", authorId)
    .single()

  if (profileError || !profile) return null

  const { data: turns, error: turnsError } = await supabase
    .from("story_turns")
    .select("room_id, like_count")
    .eq("author_id", authorId)

  if (turnsError) return null

  const turnRows = turns ?? []
  const totalTurns = turnRows.length
  const participatedRoomIds = [...new Set(turnRows.map((t) => t.room_id))]
  const totalLikes = turnRows.reduce((acc, t) => acc + (t.like_count ?? 0), 0)

  return {
    id: profile.id,
    displayName: profile.display_name?.trim() || "익명",
    avatarUrl: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
    preferredGenres: profile.preferred_genres ?? [],
    storiesCount: participatedRoomIds.length,
    totalLikes,
    totalTurns,
  }
}

export async function fetchAuthorParticipatedStories(
  authorId: string
): Promise<ProfileStory[]> {
  return fetchParticipatedStories(authorId)
}
