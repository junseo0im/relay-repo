/**
 * 랭킹 조회
 * story_rooms ORDER BY like_count + story_turns count
 */

import { createClient } from "@/lib/supabase/server"
import type { RankingStory } from "@/lib/types"
import type { DbStoryRoom } from "@/lib/types"

export type RankingTimeRange = "weekly" | "monthly" | "all"

export async function fetchRankingStories(
  genre?: string,
  timeRange: RankingTimeRange = "all",
  limit = 50
): Promise<RankingStory[]> {
  const supabase = await createClient()

  let query = supabase
    .from("story_rooms")
    .select("id, title, genre, like_count, created_at")
    .order("like_count", { ascending: false })
    .limit(limit)

  if (genre && genre !== "전체") {
    query = query.eq("genre", genre)
  }

  if (timeRange === "weekly") {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    query = query.gte("created_at", weekAgo.toISOString())
  } else if (timeRange === "monthly") {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    query = query.gte("created_at", monthAgo.toISOString())
  }

  const { data: rooms, error } = await query

  if (error || !rooms?.length) return []

  const roomIds = (rooms as DbStoryRoom[]).map((r) => r.id)

  const { data: turnCounts } = await supabase
    .from("story_turns")
    .select("room_id")
    .in("room_id", roomIds)

  const turnsByRoom: Record<string, number> = {}
  for (const t of turnCounts ?? []) {
    turnsByRoom[t.room_id] = (turnsByRoom[t.room_id] ?? 0) + 1
  }

  return (rooms as DbStoryRoom[]).map((r, i) => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    likes: r.like_count ?? 0,
    turns: turnsByRoom[r.id] ?? 0,
    rank: i + 1,
  }))
}
