"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { GENRE_VALUE_TO_DB } from "@/lib/constants"

const createStorySchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이내로 입력해주세요"),
  genre: z.enum(["free", "fantasy", "sf", "romance", "horror"]),
  firstParagraph: z.string().min(1, "첫 문단을 입력해주세요").max(1000, "첫 문단은 1000자 이내로 입력해주세요"),
  tags: z.array(z.string().max(10)).min(1, "태그를 최소 1개 선택해주세요").max(5, "태그는 최대 5개까지 선택 가능합니다"),
})

export type CreateStoryResult =
  | { success: true; roomId: string }
  | { success: false; error: string }

export async function createStory(input: {
  title: string
  genre: string
  firstParagraph: string
  tags: string[]
}): Promise<CreateStoryResult> {
  const parsed = createStorySchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? "입력값을 확인해주세요" }
  }

  const { title, genre, firstParagraph, tags } = parsed.data
  const genreDb = GENRE_VALUE_TO_DB[genre] ?? "자유"
  const preview = firstParagraph.slice(0, 200)

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const { data: room, error: roomError } = await supabase
    .from("story_rooms")
    .insert({
      title: title.trim(),
      genre: genreDb,
      tags,
      created_by: user.id,
      preview,
    })
    .select("id")
    .single()

  if (roomError) {
    return { success: false, error: roomError.message ?? "스토리 생성에 실패했습니다" }
  }

  const { error: turnError } = await supabase.from("story_turns").insert({
    room_id: room.id,
    author_id: user.id,
    content: firstParagraph.trim(),
    turn_index: 1,
  })

  if (turnError) {
    return { success: false, error: turnError.message ?? "첫 문단 저장에 실패했습니다" }
  }

  return { success: true, roomId: room.id }
}

// --- Lock & Turn 제출 ---

export type AcquireLockResult =
  | { success: true; lockExpireAt: string }
  | { success: false; error: string; lockHolder?: string; lockExpireAt?: string }

export async function acquireLock(roomId: string): Promise<AcquireLockResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("check_and_acquire_lock", {
    room_id: roomId,
    user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const res = data as { success: boolean; message?: string; lock_expire_at?: string; current_lock_user_id?: string }
  if (!res.success) {
    return {
      success: false,
      error: res.message ?? "Lock 획득에 실패했습니다",
      lockHolder: res.current_lock_user_id,
      lockExpireAt: res.lock_expire_at,
    }
  }

  return {
    success: true,
    lockExpireAt: res.lock_expire_at ?? new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  }
}

export type SubmitTurnResult =
  | { success: true; turnId: string }
  | { success: false; error: string }

export async function submitTurn(
  roomId: string,
  content: string
): Promise<SubmitTurnResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("submit_turn", {
    room_id: roomId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const res = data as { success: boolean; message?: string; turn_id?: string }
  if (!res.success) {
    return { success: false, error: res.message ?? "제출에 실패했습니다" }
  }

  revalidatePath(`/story/${roomId}`)
  return { success: true, turnId: res.turn_id ?? "" }
}

// --- 완성하기 ---

export type CompleteStoryResult =
  | { success: true }
  | { success: false; error: string }

export async function completeStory(roomId: string): Promise<CompleteStoryResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const { error } = await supabase
    .from("story_rooms")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId)
    .eq("created_by", user.id)

  if (error) {
    return { success: false, error: error.message ?? "완성 처리에 실패했습니다" }
  }

  revalidatePath(`/story/${roomId}`)
  revalidatePath("/completed")
  return { success: true }
}
