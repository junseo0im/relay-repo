/**
 * 스토리 조회 쿼리
 * story_rooms 기반 필터/정렬/페이지네이션
 */

import { createClient } from "@/lib/supabase/server"
import { GENRE_VALUE_TO_DB } from "@/lib/constants"
import { mapRoomToStory, mapRoomToCompletedStory, mapTurnToParagraph } from "@/lib/mappers"
import type { Story, StoryDetail, CompletedStory } from "@/lib/types"
import type { DbStoryRoom, DbStoryTurn, DbProfile } from "@/lib/types"

export interface FetchStoriesOptions {
  genre?: string
  search?: string
  sort?: "latest" | "likes" | "deadline"
  page?: number
  limit?: number
}

export interface FetchStoriesResult {
  stories: Story[]
  totalCount: number
}

export async function fetchStories(
  options: FetchStoriesOptions = {}
): Promise<FetchStoriesResult> {
  const { genre = "all", search = "", sort = "latest", page = 1, limit = 9 } = options
  const supabase = await createClient()

  let query = supabase
    .from("story_rooms")
    .select("*", { count: "exact" })
    .eq("is_completed", false)

  if (genre !== "all") {
    const genreDb = GENRE_VALUE_TO_DB[genre]
    if (genreDb) {
      query = query.eq("genre", genreDb)
    }
  }

  if (search.trim()) {
    const q = search.trim().replace(/#/g, "")
    query = query.or(`title.ilike.%${q}%,preview.ilike.%${q}%`)
  }

  switch (sort) {
    case "likes":
      query = query.order("like_count", { ascending: false })
      break
    case "deadline":
      query = query.order("challenge_id", { ascending: false, nullsFirst: false })
      break
    case "latest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data: rows, error, count } = await query

  if (error) {
    return { stories: [], totalCount: 0 }
  }

  const rooms = (rows ?? []) as DbStoryRoom[]
  const roomIds = rooms.map((r) => r.id)

  const turnCounts: Record<string, number> = {}
  if (roomIds.length > 0) {
    const { data: turns } = await supabase
      .from("story_turns")
      .select("room_id")
      .in("room_id", roomIds)
    for (const t of turns ?? []) {
      turnCounts[t.room_id] = (turnCounts[t.room_id] ?? 0) + 1
    }
  }

  const stories: Story[] = rooms.map((room) =>
    mapRoomToStory(room, turnCounts[room.id] ?? 0)
  )

  return {
    stories,
    totalCount: count ?? 0,
  }
}

export interface FetchStoryDetailResult {
  story: StoryDetail | null
  createdBy?: string | null
}

export async function fetchStoryDetail(roomId: string): Promise<FetchStoryDetailResult> {
  const supabase = await createClient()

  const { data: room, error: roomError } = await supabase
    .from("story_rooms")
    .select("*")
    .eq("id", roomId)
    .single()

  if (roomError || !room) {
    return { story: null }
  }

  const { data: turns, error: turnsError } = await supabase
    .from("story_turns")
    .select("*")
    .eq("room_id", roomId)
    .order("turn_index", { ascending: true })

  if (turnsError) {
    return { story: null }
  }

  const authorIds = [...new Set((turns ?? []).map((t: DbStoryTurn) => t.author_id))]
  const profilesMap: Record<string, DbProfile> = {}

  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", authorIds)
    for (const p of profiles ?? []) {
      profilesMap[p.id] = p
    }
  }

  const paragraphs = (turns ?? []).map((turn: DbStoryTurn) =>
    mapTurnToParagraph(turn, profilesMap[turn.author_id] ?? null)
  )

  const storyBase = mapRoomToStory(room as DbStoryRoom, paragraphs.length)
  const story: StoryDetail = {
    ...storyBase,
    paragraphs,
  }

  return { story, createdBy: (room as DbStoryRoom).created_by }
}

// --- 완성 작품 갤러리 ---

export interface FetchCompletedStoriesOptions {
  genre?: string
  search?: string
  sort?: "latest" | "likes" | "turns" | "authors"
  page?: number
  limit?: number
}

export interface FetchCompletedStoriesResult {
  stories: CompletedStory[]
  totalCount: number
}

export async function fetchCompletedStories(
  options: FetchCompletedStoriesOptions = {}
): Promise<FetchCompletedStoriesResult> {
  const { genre = "all", search = "", sort = "latest", page = 1, limit = 9 } = options
  const supabase = await createClient()

  let query = supabase
    .from("story_rooms")
    .select("*", { count: "exact" })
    .eq("is_completed", true)

  if (genre !== "all") {
    const genreDb = GENRE_VALUE_TO_DB[genre]
    if (genreDb) {
      query = query.eq("genre", genreDb)
    }
  }

  if (search.trim()) {
    const q = search.trim().replace(/#/g, "")
    query = query.or(`title.ilike.%${q}%,preview.ilike.%${q}%`)
  }

  const needTurnSort = sort === "turns"

  switch (sort) {
    case "likes":
      query = query.order("like_count", { ascending: false })
      break
    case "authors":
      query = query.order("total_authors", { ascending: false })
      break
    case "turns":
    case "latest":
    default:
      query = query.order("completed_at", { ascending: false, nullsFirst: false })
      break
  }

  if (!needTurnSort) {
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
  }

  const { data: rows, error, count } = await query

  if (error) {
    return { stories: [], totalCount: 0 }
  }

  let rooms = (rows ?? []) as DbStoryRoom[]
  const roomIds = rooms.map((r) => r.id)

  const turnCounts: Record<string, number> = {}
  if (roomIds.length > 0) {
    const { data: turns } = await supabase
      .from("story_turns")
      .select("room_id")
      .in("room_id", roomIds)
    for (const t of turns ?? []) {
      turnCounts[t.room_id] = (turnCounts[t.room_id] ?? 0) + 1
    }
  }

  if (needTurnSort) {
    rooms.sort((a, b) => (turnCounts[b.id] ?? 0) - (turnCounts[a.id] ?? 0))
    const offset = (page - 1) * limit
    rooms = rooms.slice(offset, offset + limit)
  }

  const stories: CompletedStory[] = rooms.map((room) =>
    mapRoomToCompletedStory(room, turnCounts[room.id])
  )

  return {
    stories,
    totalCount: count ?? 0,
  }
}
