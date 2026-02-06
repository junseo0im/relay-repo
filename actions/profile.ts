"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const VALID_GENRES = ["자유", "판타지", "SF", "로맨스", "공포"] as const

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "표시 이름을 입력해주세요")
    .max(20, "표시 이름은 20자 이내로 입력해주세요")
    .trim(),
  avatarUrl: z
    .string()
    .refine(
      (val) => val === "" || /^https?:\/\/.+/.test(val),
      "올바른 이미지 URL을 입력해주세요"
    )
    .optional()
    .default(""),
  bio: z
    .string()
    .max(150, "한 줄 소개는 150자 이내로 입력해주세요")
    .optional()
    .default(""),
  preferredGenres: z
    .array(z.enum(VALID_GENRES))
    .max(5, "선호 장르는 최대 5개까지 선택 가능합니다"),
})

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string }

export async function updateProfile(input: {
  displayName: string
  avatarUrl?: string
  bio?: string
  preferredGenres: string[]
}): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse({
    ...input,
    avatarUrl: input.avatarUrl ?? "",
    bio: input.bio ?? "",
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? "입력값을 확인해주세요" }
  }

  const { displayName, avatarUrl, bio, preferredGenres } = parsed.data

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "로그인이 필요합니다" }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        display_name: displayName,
        avatar_url: avatarUrl || null,
        bio: bio || null,
        preferred_genres: preferredGenres,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

  if (updateError) {
    console.error("[updateProfile]", updateError)
    return { success: false, error: "프로필 저장에 실패했습니다" }
  }

  revalidatePath("/profile")
  revalidatePath("/profile/settings")
  revalidatePath(`/profile/${user.id}`)
  return { success: true }
}
