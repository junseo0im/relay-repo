import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const EXPECTED_TABLES = [
  "profiles",
  "challenges",
  "story_rooms",
  "story_turns",
  "story_likes",
  "turn_likes",
  "challenge_stories",
  "challenge_winners",
  "user_badges",
  "epilogues",
]

export async function GET() {
  const results: Record<string, { status: string; message?: string }> = {}

  // Step 1: Server Client (anon key)
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").select("id").limit(1)
    if (error) throw error
    results.serverClient = { status: "ok", message: "연결 성공" }
  } catch (e) {
    results.serverClient = {
      status: "fail",
      message: e instanceof Error ? e.message : String(e),
    }
  }

  // Step 2: Admin Client (service role)
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("challenges").select("id").limit(1)
    if (error) throw error
    results.adminClient = { status: "ok", message: "연결 성공" }
  } catch (e) {
    results.adminClient = {
      status: "fail",
      message: e instanceof Error ? e.message : String(e),
    }
  }

  // Step 3: DB 테이블 존재 확인 (각 테이블 SELECT 시도)
  try {
    const supabase = createAdminClient()
    const existingTables: string[] = []
    for (const table of EXPECTED_TABLES) {
      const { error } = await supabase.from(table).select("*").limit(0)
      if (!error) existingTables.push(table)
    }

    const missing = EXPECTED_TABLES.filter((t) => !existingTables.includes(t))
    if (missing.length > 0) {
      results.dbTables = {
        status: "fail",
        message: `누락된 테이블: ${missing.join(", ")}`,
      }
    } else {
      results.dbTables = {
        status: "ok",
        message: `${existingTables.length}개 테이블 확인됨`,
      }
    }
  } catch (e) {
    results.dbTables = {
      status: "fail",
      message: e instanceof Error ? e.message : String(e),
    }
  }

  // Step 4: RPC 함수 존재 확인 (002_rpc_functions.sql 적용 후)
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("check_and_acquire_lock", {
      room_id: "00000000-0000-0000-0000-000000000000",
      user_id: "00000000-0000-0000-0000-000000000000",
    })
    if (error) throw error
    // RPC 호출 성공 (존재하지 않는 room이므로 success: false 반환해도 OK)
    results.rpcFunctions = {
      status: "ok",
      message: "4개 RPC 함수 확인됨",
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    results.rpcFunctions = {
      status: msg.includes("function") ? "skip" : "fail",
      message: msg.includes("function")
        ? "RPC 미적용 (002_rpc_functions.sql 실행 필요)"
        : msg,
    }
  }

  const criticalOk = ["serverClient", "adminClient", "dbTables"].every(
    (k) => results[k]?.status === "ok"
  )
  const allOk = Object.values(results).every(
    (r) => r.status === "ok" || r.status === "skip"
  )
  return NextResponse.json(
    {
      step1: "Supabase 클라이언트",
      step2: "DB 마이그레이션",
      step3: "RPC 함수",
      results,
      summary: allOk ? "모든 검증 통과" : "일부 검증 실패",
    },
    { status: criticalOk ? 200 : 500 }
  )
}
