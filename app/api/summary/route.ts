import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId } = body as { roomId?: string }

    if (!roomId || typeof roomId !== "string") {
      return Response.json({ error: "roomId is required" }, { status: 400 })
    }

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey?.trim()) {
      return Response.json(
        { error: "GROQ_API_KEY가 설정되지 않았습니다. .env.local에 추가해주세요." },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()
    const { data: turns } = await supabase
      .from("story_turns")
      .select("content")
      .eq("room_id", roomId)
      .order("turn_index", { ascending: true })

    if (!turns?.length) {
      return Response.json({ summary: "아직 작성된 내용이 없습니다." })
    }

    const fullText = turns.map((t) => t.content).join("\n\n")
    const truncated = fullText.slice(0, 8000)

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "당신은 이야기 요약 전문가입니다. 주어진 협업 스토리 내용을 2~4문장으로 간결하게 줄거리 요약해주세요. 줄거리만 출력하고, 다른 설명은 하지 마세요.",
          },
          {
            role: "user",
            content: `다음 이야기의 줄거리를 요약해주세요:\n\n${truncated}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[api/summary] GROQ error:", err)
      return Response.json(
        { error: "요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      )
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const summary =
      data.choices?.[0]?.message?.content?.trim() || "요약을 생성할 수 없습니다."

    return Response.json({ summary })
  } catch (err) {
    console.error("[api/summary]", err)
    return Response.json(
      { error: "요약 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
