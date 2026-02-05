import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET = "covers"

type ImageResult = { buffer: Buffer; contentType: string; ext: string }

function isImageBuffer(buf: Buffer): boolean {
  if (buf.length < 4) return false
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8
  const png = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  const webp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
  return jpeg || png || webp
}

/** Pollinations.ai: 무료, API 키 불필요. 짧은 영문 프롬프트 권장 */
async function generateImageWithPollinations(prompt: string): Promise<ImageResult | null> {
  const shortPrompt = prompt.slice(0, 120).replace(/["\n]/g, " ").trim()
  const encoded = encodeURIComponent(shortPrompt)
  const url = `https://image.pollinations.ai/prompt/${encoded}?model=flux`
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(90_000),
        headers: { "User-Agent": "StoryCover/1.0" },
      })
      if (!res.ok) {
        console.warn("[api/cover] Pollinations status:", res.status, await res.text().catch(() => ""))
        continue
      }
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      if (!isImageBuffer(buffer)) {
        console.warn("[api/cover] Pollinations returned non-image, length:", buffer.length)
        continue
      }
      const ct = res.headers.get("content-type") ?? "image/jpeg"
      const ext = ct.includes("png") ? "png" : "jpg"
      return { buffer, contentType: ct.includes("png") ? "image/png" : "image/jpeg", ext }
    } catch (e) {
      console.warn("[api/cover] Pollinations attempt", attempt + 1, "failed:", e)
    }
  }
  return null
}

/** Replicate FLUX Schnell: REPLICATE_API_TOKEN 필요, $5 무료 크레딧 */
async function generateImageWithReplicate(
  prompt: string,
  token: string
): Promise<ImageResult | null> {
  const res = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait=90",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: "2:3",
        },
      }),
      signal: AbortSignal.timeout(120_000),
    }
  )
  if (!res.ok) {
    console.warn("[api/cover] Replicate status:", res.status, await res.text().catch(() => ""))
    return null
  }
  const data = (await res.json()) as {
    output?: string | string[]
    error?: string
    status?: string
  }
  if (data.error || data.status === "failed") {
    console.warn("[api/cover] Replicate error:", data.error ?? data.status)
    return null
  }
  if (data.status !== "succeeded" || !data.output) {
    console.warn("[api/cover] Replicate not ready:", data.status)
    return null
  }
  const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output
  if (!imageUrl || typeof imageUrl !== "string") return null
  const imgRes = await fetch(imageUrl, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30_000),
  })
  if (!imgRes.ok) return null
  const arrayBuffer = await imgRes.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (!isImageBuffer(buffer)) return null
  return { buffer, contentType: "image/png", ext: "png" }
}

/** Gemini: API 키 필요, 할당량 제한 있음 */
async function generateImageWithGemini(
  prompt: string,
  apiKey: string
): Promise<ImageResult | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          responseMimeType: "image/png",
        },
      }),
      signal: AbortSignal.timeout(60_000),
    }
  )
  if (!res.ok) return null
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[]
  }
  const parts = data.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64")
      return { buffer, contentType: "image/png", ext: "png" }
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId } = body as { roomId?: string }

    if (!roomId || typeof roomId !== "string") {
      return Response.json({ error: "roomId is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: room, error: roomError } = await admin
      .from("story_rooms")
      .select("id, title, genre, preview, is_completed, created_by")
      .eq("id", roomId)
      .single()

    if (roomError || !room) {
      return Response.json({ error: "스토리를 찾을 수 없습니다" }, { status: 404 })
    }

    if (!room.is_completed) {
      return Response.json({ error: "완성된 스토리만 표지를 생성할 수 있습니다" }, { status: 400 })
    }

    if (room.created_by !== user.id) {
      return Response.json({ error: "스토리 생성자만 표지를 생성할 수 있습니다" }, { status: 403 })
    }

    const prompt = `Book cover illustration for a collaborative story titled "${room.title}" (genre: ${room.genre}). Atmospheric, suitable for a novel cover. No text on the image. Portrait, 3:4 aspect ratio.`

    const replicateToken = process.env.REPLICATE_API_TOKEN?.trim()
    const geminiKey =
      process.env.GOOGLE_GENERATIVE ??
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_GENERATIVE_AI_API_KEY

    let result: ImageResult | null = null

    // 1) Pollinations 먼저 시도 (무료, API 키 불필요)
    try {
      result = await generateImageWithPollinations(prompt)
    } catch (e) {
      console.warn("[api/cover] Pollinations failed:", e)
    }

    // 2) Replicate fallback (REPLICATE_API_TOKEN 있을 때)
    if (!result && replicateToken) {
      try {
        result = await generateImageWithReplicate(prompt, replicateToken)
      } catch (e) {
        console.warn("[api/cover] Replicate fallback failed:", e)
      }
    }

    // 3) Gemini fallback (GOOGLE_GENERATIVE 있을 때)
    if (!result && geminiKey?.trim()) {
      try {
        result = await generateImageWithGemini(prompt, geminiKey.trim())
      } catch (e) {
        console.warn("[api/cover] Gemini fallback failed:", e)
      }
    }

    if (!result) {
      return Response.json(
        {
          error:
            "이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요. (Replicate API 토큰 추가 시 더 안정적)",
        },
        { status: 502 }
      )
    }

    const { buffer, contentType, ext } = result
    const fileName = `${roomId}-${Date.now()}.${ext}`
    const filePath = fileName

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error("[api/cover] Storage upload error:", uploadError)
      return Response.json(
        {
          error:
            "이미지 업로드에 실패했습니다. Supabase Storage에 'covers' 버킷을 생성해주세요.",
        },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(filePath)

    const { error: updateError } = await admin
      .from("story_rooms")
      .update({ cover_image: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", roomId)

    if (updateError) {
      return Response.json({ error: "표지 저장에 실패했습니다" }, { status: 500 })
    }

    return Response.json({ success: true, coverUrl: publicUrl })
  } catch (err) {
    console.error("[api/cover]", err)
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
