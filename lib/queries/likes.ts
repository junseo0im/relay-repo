/**
 * 좋아요 상태 조회
 */

import { createClient } from "@/lib/supabase/server"

/**
 * 현재 사용자가 여러 턴에 좋아요를 눌렀는지 bulk 조회
 * @returns Set of turn_id that the user has liked
 */
export async function fetchTurnLikeStatuses(
  turnIds: string[],
  userId: string | null
): Promise<Set<string>> {
  if (!userId || turnIds.length === 0) return new Set()

  const supabase = await createClient()
  const { data } = await supabase
    .from("turn_likes")
    .select("turn_id")
    .eq("user_id", userId)
    .in("turn_id", turnIds)

  return new Set((data ?? []).map((r) => r.turn_id))
}

/**
 * 현재 사용자가 스토리(room)에 좋아요를 눌렀는지 조회
 */
export async function fetchStoryLikeStatus(
  roomId: string,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from("story_likes")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle()

  return !!data
}
