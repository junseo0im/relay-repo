/**
 * 챌린지 조회
 * challenges + challenge_stories 집계
 */

import { createClient } from "@/lib/supabase/server"
import { mapChallenge } from "@/lib/mappers"
import type { Challenge } from "@/lib/types"
import type { DbChallenge, DbStoryRoom } from "@/lib/types"

export async function fetchChallenges(): Promise<Challenge[]> {
  const supabase = await createClient()

  const { data: challenges, error: challengesError } = await supabase
    .from("challenges")
    .select("*")
    .order("start_at", { ascending: true })

  if (challengesError || !challenges?.length) {
    return []
  }

  const challengeIds = (challenges as DbChallenge[]).map((c) => c.id)
  const { data: storyCounts } = await supabase
    .from("challenge_stories")
    .select("challenge_id")
    .in("challenge_id", challengeIds)

  const countByChallenge: Record<string, number> = {}
  for (const row of storyCounts ?? []) {
    const cid = (row as { challenge_id: string }).challenge_id
    countByChallenge[cid] = (countByChallenge[cid] ?? 0) + 1
  }

  return (challenges as DbChallenge[]).map((c) =>
    mapChallenge(c, countByChallenge[c.id] ?? 0)
  )
}

export interface ActiveChallenge extends Challenge {
  endAt: string // ISO string for countdown
}

export async function fetchBannerChallenge(): Promise<ActiveChallenge | null> {
  const supabase = await createClient()

  const { data: active, error: activeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "active")
    .order("end_at", { ascending: true })
    .limit(1)

  if (!activeError && active?.length) {
    const c = active[0] as DbChallenge
    const { count } = await supabase
      .from("challenge_stories")
      .select("id", { count: "exact", head: true })
      .eq("challenge_id", c.id)
    return {
      ...mapChallenge(c, count ?? 0),
      endAt: c.end_at,
    }
  }

  const { data: upcoming, error: upcomingError } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "upcoming")
    .order("start_at", { ascending: true })
    .limit(1)

  if (upcomingError || !upcoming?.length) return null

  const c = upcoming[0] as DbChallenge
  const { count } = await supabase
    .from("challenge_stories")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", c.id)

  return {
    ...mapChallenge(c, count ?? 0),
    endAt: c.start_at,
  }
}

export interface AwardWinnerStory {
  id: string
  title: string
  author: string
  challengeName: string
  rank: number
  likes: number
  excerpt: string
}

export async function fetchChallengeWinners(): Promise<AwardWinnerStory[]> {
  const supabase = await createClient()

  const { data: winners, error: winnersError } = await supabase
    .from("challenge_winners")
    .select("challenge_id, room_id, rank")
    .order("rank", { ascending: true })
    .limit(9)

  if (winnersError || !winners?.length) return []

  const roomIds = [...new Set((winners as { room_id: string }[]).map((w) => w.room_id))]
  const challengeIds = [...new Set((winners as { challenge_id: string }[]).map((w) => w.challenge_id))]

  const [roomsRes, challengesRes] = await Promise.all([
    supabase.from("story_rooms").select("id, title, preview, like_count, created_by").in("id", roomIds),
    supabase.from("challenges").select("id, title").in("id", challengeIds),
  ])

  const rooms = new Map((roomsRes.data ?? []).map((r) => [r.id, r]))
  const challenges = new Map((challengesRes.data ?? []).map((c) => [c.id, c]))
  const authorIds = [...new Set((roomsRes.data ?? []).map((r) => r.created_by).filter(Boolean))] as string[]

  let profiles = new Map<string, { display_name: string | null }>()
  if (authorIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", authorIds)
    profiles = new Map((profs ?? []).map((p) => [p.id, p]))
  }

  return (winners as { challenge_id: string; room_id: string; rank: number }[]).map((w) => {
    const room = rooms.get(w.room_id)
    const challenge = challenges.get(w.challenge_id)
    const profile = room ? profiles.get(room.created_by ?? "") : null
    return {
      id: w.room_id,
      title: room?.title ?? "",
      author: profile?.display_name?.trim() || "익명",
      challengeName: challenge?.title ?? "",
      rank: w.rank,
      likes: room?.like_count ?? 0,
      excerpt: room?.preview?.slice(0, 100) ?? "",
    }
  })
}

export async function fetchChallengeById(
  challengeId: string
): Promise<Challenge | null> {
  const supabase = await createClient()

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single()

  if (challengeError || !challenge) return null

  const { count } = await supabase
    .from("challenge_stories")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challengeId)

  return mapChallenge(challenge as DbChallenge, count ?? 0)
}

export interface ChallengeStory {
  id: string
  title: string
  genre: string
  preview?: string
  turns: number
  likes: number
}

export async function fetchChallengeStories(
  challengeId: string
): Promise<ChallengeStory[]> {
  const supabase = await createClient()

  const { data: links, error: linksError } = await supabase
    .from("challenge_stories")
    .select("room_id")
    .eq("challenge_id", challengeId)

  if (linksError || !links?.length) return []

  const roomIds = (links as { room_id: string }[]).map((l) => l.room_id)

  const { data: rooms, error: roomsError } = await supabase
    .from("story_rooms")
    .select("id, title, genre, preview, like_count")
    .in("id", roomIds)

  if (roomsError || !rooms?.length) return []

  const turnCounts: Record<string, number> = {}
  const { data: turns } = await supabase
    .from("story_turns")
    .select("room_id")
    .in("room_id", roomIds)
  for (const t of turns ?? []) {
    turnCounts[t.room_id] = (turnCounts[t.room_id] ?? 0) + 1
  }

  return (rooms as DbStoryRoom[]).map((r) => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    preview: r.preview ?? undefined,
    turns: turnCounts[r.id] ?? 0,
    likes: r.like_count ?? 0,
  }))
}
