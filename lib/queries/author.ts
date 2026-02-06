/**
 * 인기 작가 조회
 * profiles + story_turns 집계 + user_badges
 */

import { createClient } from "@/lib/supabase/server"
import type { PopularAuthor } from "@/lib/types"

const BADGE_ORDER: Record<string, number> = {
  "전설 작가": 3,
  "베테랑 작가": 2,
  "인기 작가": 1,
}

export async function fetchPopularAuthors(limit = 12): Promise<PopularAuthor[]> {
  const supabase = await createClient()

  const { data: turns, error: turnsError } = await supabase
    .from("story_turns")
    .select("author_id, room_id, like_count")

  if (turnsError || !turns?.length) return []

  const byAuthor = new Map<
    string,
    { turns: number; likes: number; rooms: Set<string> }
  >()
  for (const t of turns) {
    const cur = byAuthor.get(t.author_id) ?? {
      turns: 0,
      likes: 0,
      rooms: new Set<string>(),
    }
    cur.turns += 1
    cur.likes += t.like_count ?? 0
    cur.rooms.add(t.room_id)
    byAuthor.set(t.author_id, cur)
  }

  const topAuthors = [...byAuthor.entries()]
    .sort((a, b) => b[1].likes - a[1].likes)
    .slice(0, limit)
    .map(([id, stats]) => ({
      id,
      storiesCount: stats.rooms.size,
      totalTurns: stats.turns,
      totalLikes: stats.likes,
    }))

  if (topAuthors.length === 0) return []

  const authorIds = topAuthors.map((a) => a.id)

  const [profilesRes, badgesRes] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url").in("id", authorIds),
    supabase.from("user_badges").select("user_id, badge_type").in("user_id", authorIds),
  ])

  const profiles = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  )
  const badgesByUser = new Map<string, string>()
  for (const b of badgesRes.data ?? []) {
    const existing = badgesByUser.get(b.user_id)
    const order = BADGE_ORDER[b.badge_type] ?? 0
    const existingOrder = existing ? (BADGE_ORDER[existing] ?? 0) : -1
    if (!existing || order > existingOrder) {
      badgesByUser.set(b.user_id, b.badge_type)
    }
  }

  return topAuthors.map((a) => {
    const profile = profiles.get(a.id)
    return {
      id: a.id,
      name: profile?.display_name?.trim() || "익명",
      avatar: profile?.avatar_url ?? undefined,
      storiesCount: a.storiesCount,
      totalLikes: a.totalLikes,
      totalTurns: a.totalTurns,
      badge: badgesByUser.get(a.id),
    }
  })
}
