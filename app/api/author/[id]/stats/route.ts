import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: authorId } = await params
  if (!authorId) {
    return Response.json({ error: "authorId required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: turns } = await supabase
    .from("story_turns")
    .select("room_id, like_count")
    .eq("author_id", authorId)

  if (!turns?.length) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", authorId)
      .single()
    const { data: badges } = await supabase
      .from("user_badges")
      .select("badge_type")
      .eq("user_id", authorId)
      .limit(1)
    return Response.json({
      storiesCount: 0,
      totalLikes: 0,
      totalTurns: 0,
      badge: badges?.[0]?.badge_type,
      name: profile?.display_name?.trim() || "익명",
    })
  }

  const rooms = new Set(turns.map((t) => t.room_id))
  const totalTurns = turns.length
  const totalLikes = turns.reduce((sum, t) => sum + (t.like_count ?? 0), 0)

  const [badgesRes] = await Promise.all([
    supabase.from("user_badges").select("badge_type").eq("user_id", authorId),
  ])

  const BADGE_ORDER: Record<string, number> = {
    "전설 작가": 3,
    "베테랑 작가": 2,
    "인기 작가": 1,
  }
  const badge =
    (badgesRes.data ?? []).sort(
      (a, b) => (BADGE_ORDER[b.badge_type] ?? 0) - (BADGE_ORDER[a.badge_type] ?? 0)
    )[0]?.badge_type

  return Response.json({
    storiesCount: rooms.size,
    totalLikes,
    totalTurns,
    badge,
  })
}
