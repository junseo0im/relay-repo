import { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createAdminClient } from "@/lib/supabase/admin"

export interface GuideResponse {
  tone: string
  pace: string
  nextDirection: string
  tips: { title: string; description: string }[]
  suggestions: string[]
  genreTip?: string
}

const SYSTEM_PROMPT = `당신은 협업 스토리 작성 도우미입니다. 사용자가 이어쓰기를 할 때 참고할 수 있는 가이드를 제공합니다.
반드시 아래 JSON 형식으로만 응답하세요. 다른 설명 없이 JSON만 출력합니다.

{
  "tone": "스토리의 현재 톤/분위기 (예: 신비로운, 긴장감 있는, 따뜻한)",
  "pace": "현재 페이스 (예: 느림, 중간, 빠름)",
  "nextDirection": "다음 턴에서 고려할 방향 (한 문장)",
  "tips": [
    { "title": "팁 제목", "description": "팁 설명" },
    ...
  ],
  "suggestions": ["문장 제안 1", "문장 제안 2", "문장 제안 3"],
  "genreTip": "장르별 짧은 조언 (선택)"
}`

function parseGuideResponse(text: string): GuideResponse | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : text
  try {
    const guide = JSON.parse(jsonStr) as GuideResponse
    if (!guide.tone) guide.tone = "일반적인"
    if (!guide.pace) guide.pace = "중간"
    if (!guide.nextDirection) guide.nextDirection = "이야기 흐름에 맞게 이어가기"
    if (!Array.isArray(guide.tips)) guide.tips = []
    if (!Array.isArray(guide.suggestions)) guide.suggestions = []
    return guide
  } catch {
    return null
  }
}

async function callGemini(apiKey: string, userPrompt: string): Promise<string | null> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  })
  const result = await model.generateContent(userPrompt)
  return result.response.text() ?? null
}

async function callGroq(apiKey: string, userPrompt: string): Promise<string | null> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.5,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId } = body as { roomId?: string }

    if (!roomId || typeof roomId !== "string") {
      return Response.json({ error: "roomId is required" }, { status: 400 })
    }

    const geminiKey =
      process.env.GOOGLE_GENERATIVE ??
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
      process.env.GOOGLE_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!geminiKey?.trim() && !groqKey?.trim()) {
      return Response.json(
        {
          error:
            "AI service not configured. Set GOOGLE_GENERATIVE or GROQ_API_KEY in .env.local.",
        },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()

    const { data: room, error: roomError } = await supabase
      .from("story_rooms")
      .select("id, title, genre")
      .eq("id", roomId)
      .single()

    if (roomError || !room) {
      return Response.json({ error: "Story not found" }, { status: 404 })
    }

    const { data: turns, error: turnsError } = await supabase
      .from("story_turns")
      .select("content, turn_index")
      .eq("room_id", roomId)
      .order("turn_index", { ascending: false })
      .limit(10)

    if (turnsError) {
      return Response.json({ error: "Failed to fetch turns" }, { status: 500 })
    }

    const recentTurns = (turns ?? []).reverse()
    const turnsText =
      recentTurns.length > 0
        ? recentTurns.map((t) => `[턴 ${t.turn_index}]\n${t.content}`).join("\n\n")
        : "(아직 작성된 턴이 없습니다)"

    const userPrompt = `다음은 "${room.title}" (장르: ${room.genre}) 스토리의 최근 턴들입니다.

---
${turnsText}
---

위 내용을 분석하여 JSON 형식으로 작성 가이드를 제공해주세요.`

    let text: string | null = null

    // 1) Gemini 시도 (할당량 초과 시 GROQ로 fallback)
    if (geminiKey?.trim()) {
      try {
        text = await callGemini(geminiKey, userPrompt)
      } catch (err) {
        console.warn("[api/guide] Gemini failed:", err instanceof Error ? err.message : err)
      }
    }

    // 2) GROQ fallback (Gemini 실패/할당량 초과 시 또는 Gemini 키 없을 때)
    if (!text && groqKey?.trim()) {
      try {
        text = await callGroq(groqKey, userPrompt)
      } catch (err) {
        console.error("[api/guide] GROQ fallback failed", err)
      }
    }

    if (!text) {
      return Response.json(
        {
          error:
            "AI 응답을 받지 못했습니다. Gemini 할당량을 초과했을 수 있습니다. 잠시 후 다시 시도하거나, GROQ_API_KEY를 설정해주세요.",
        },
        { status: 503 }
      )
    }

    const guide = parseGuideResponse(text)
    if (!guide) {
      return Response.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 500 }
      )
    }

    return Response.json(guide)
  } catch (err) {
    console.error("[api/guide]", err)
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
