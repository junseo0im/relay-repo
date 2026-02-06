"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type ToggleTurnLikeResult =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; error: string }

export async function toggleTurnLike(turnId: string): Promise<ToggleTurnLikeResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("toggle_turn_like", {
    turn_id: turnId,
    user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const res = data as { success?: boolean; liked?: boolean; like_count?: number }
  return {
    success: true,
    liked: res.liked ?? false,
    likeCount: res.like_count ?? 0,
  }
}

export type ToggleStoryLikeResult =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; error: string }

export async function toggleStoryLike(roomId: string): Promise<ToggleStoryLikeResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("toggle_story_like", {
    room_id: roomId,
    user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const res = data as { success?: boolean; liked?: boolean; like_count?: number }
  return {
    success: true,
    liked: res.liked ?? false,
    likeCount: res.like_count ?? 0,
  }
}

export type ToggleEpilogueLikeResult =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; error: string }

export async function toggleEpilogueLike(
  epilogueId: string
): Promise<ToggleEpilogueLikeResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("toggle_epilogue_like", {
    p_epilogue_id: epilogueId,
    p_user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const res = data as { success?: boolean; liked?: boolean; like_count?: number }
  return {
    success: true,
    liked: res.liked ?? false,
    likeCount: res.like_count ?? 0,
  }
}
