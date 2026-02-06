/**
 * 에필로그 조회
 * epilogues + profiles 조인으로 작성자 정보 포함
 */

import { createClient } from "@/lib/supabase/server"
import type { Epilogue } from "@/lib/types"
import type { DbEpilogue } from "@/lib/types"

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

export async function fetchEpilogues(roomId: string): Promise<Epilogue[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from("epilogues")
    .select("id, room_id, author_id, content, like_count, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })

  if (error || !rows?.length) {
    return []
  }

  const authorIds = [...new Set((rows as DbEpilogue[]).map((e) => e.author_id))]
  const profilesMap: Record<
    string,
    { id: string; display_name: string | null; avatar_url: string | null }
  > = {}

  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", authorIds)
    for (const p of profiles ?? []) {
      profilesMap[p.id] = p
    }
  }

  return (rows as DbEpilogue[]).map((e) => {
    const profile = profilesMap[e.author_id] ?? null
    const authorName = profile?.display_name?.trim() || "익명"
    return {
      id: e.id,
      author: authorName,
      authorId: e.author_id,
      authorAvatar: profile?.avatar_url ?? undefined,
      content: e.content,
      createdAt: formatRelativeTime(e.created_at),
      likes: e.like_count,
    }
  })
}

export async function fetchEpilogueLikeStatuses(
  epilogueIds: string[],
  userId: string | null
): Promise<Set<string>> {
  if (!userId || epilogueIds.length === 0) return new Set()

  const supabase = await createClient()
  const { data } = await supabase
    .from("epilogue_likes")
    .select("epilogue_id")
    .eq("user_id", userId)
    .in("epilogue_id", epilogueIds)

  return new Set((data ?? []).map((r) => r.epilogue_id))
}
