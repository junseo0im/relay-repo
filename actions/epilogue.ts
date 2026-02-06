"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const MAX_EPILOGUE_CHARS = 300

const createEpilogueSchema = z.object({
  roomId: z.string().uuid("올바른 스토리 ID가 아닙니다"),
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(MAX_EPILOGUE_CHARS, `에필로그는 ${MAX_EPILOGUE_CHARS}자 이내로 작성해주세요`),
})

export type CreateEpilogueResult =
  | { success: true }
  | { success: false; error: string }

export async function createEpilogue(input: {
  roomId: string
  content: string
}): Promise<CreateEpilogueResult> {
  const parsed = createEpilogueSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? "입력값을 확인해주세요" }
  }

  const { roomId, content } = parsed.data

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
    .select("id, is_completed")
    .eq("id", roomId)
    .single()

  if (roomError || !room) {
    return { success: false, error: "스토리를 찾을 수 없습니다" }
  }

  if (!room.is_completed) {
    return { success: false, error: "완성된 스토리에만 에필로그를 작성할 수 있습니다" }
  }

  const { error: insertError } = await supabase.from("epilogues").insert({
    room_id: roomId,
    author_id: user.id,
    content: content.trim(),
  })

  if (insertError) {
    console.error("[createEpilogue]", insertError)
    return { success: false, error: "에필로그 저장에 실패했습니다" }
  }

  revalidatePath(`/story/${roomId}`)
  return { success: true }
}
