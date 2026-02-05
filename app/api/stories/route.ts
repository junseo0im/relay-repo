import { NextRequest } from "next/server"
import { fetchStories } from "@/lib/queries/story"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get("genre") ?? "all"
  const search = searchParams.get("search") ?? ""
  const sort = (searchParams.get("sort") ?? "latest") as "latest" | "likes" | "deadline"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))

  const { stories, totalCount } = await fetchStories({
    genre,
    search,
    sort,
    page,
    limit: 9,
  })

  return Response.json({ stories, totalCount })
}
