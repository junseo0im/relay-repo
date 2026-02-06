import { NextRequest } from "next/server"
import { InferenceClient } from "@huggingface/inference"
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

const HF_MODELS = [
  "black-forest-labs/FLUX.1-schnell",
  "black-forest-labs/FLUX.1-dev",
  "stabilityai/stable-diffusion-xl-base-1.0",
] as const

/** Hugging Face Inference (router.huggingface.co). HUGGINGFACE_TOKEN 필요 */
async function generateImageWithHuggingFace(
  prompt: string,
  token: string
): Promise<{ result: ImageResult | null; lastError?: string }> {
  const client = new InferenceClient(token)
  let lastError = ""

  for (const model of HF_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const blob = await client.textToImage({
          model,
          inputs: prompt,
        })

        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        if (!isImageBuffer(buffer)) {
          lastError = "Invalid image response"
          console.warn("[api/cover] HF", model, "returned non-image")
          break
        }

        const contentType = blob.type || "image/png"
        const ext = contentType.includes("png") ? "png" : "jpg"
        return {
          result: {
            buffer,
            contentType: contentType.includes("png") ? "image/png" : "image/jpeg",
            ext,
          },
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e)
        console.warn("[api/cover] HF", model, "attempt", attempt + 1, "failed:", lastError)
        if (attempt < 2) await new Promise((r) => setTimeout(r, 5000))
      }
    }
  }

  return { result: null, lastError: lastError || "Unknown error" }
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

    const hfToken = process.env.HUGGINGFACE_TOKEN?.trim()
    if (!hfToken) {
      return Response.json(
        {
          error:
            "표지 생성을 사용하려면 .env.local에 HUGGINGFACE_TOKEN을 설정해주세요. (huggingface.co/settings/tokens)",
        },
        { status: 503 }
      )
    }

    const { result, lastError } = await generateImageWithHuggingFace(prompt, hfToken)

    if (!result) {
      return Response.json(
        {
          error:
            "이미지 생성에 실패했습니다. 나중에 다시 시도하거나 '나중에 하기'를 선택해주세요.",
          detail: lastError,
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
