import { NextRequest } from "next/server"
import { fetchRankingStories, type RankingTimeRange } from "@/lib/queries/ranking"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get("genre") ?? "전체"
  const timeRange = (searchParams.get("timeRange") ?? "all") as RankingTimeRange

  const stories = await fetchRankingStories(
    genre === "전체" ? undefined : genre,
    timeRange,
    50
  )

  return Response.json({ stories })
}
