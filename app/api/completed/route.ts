import { NextRequest } from "next/server"
import { fetchCompletedStories } from "@/lib/queries/story"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get("genre") ?? "all"
  const search = searchParams.get("search") ?? ""
  const sort = (searchParams.get("sort") ?? "latest") as
    | "latest"
    | "likes"
    | "turns"
    | "authors"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))

  const { stories, totalCount } = await fetchCompletedStories({
    genre,
    search,
    sort,
    page,
    limit: 9,
  })

  return Response.json({ stories, totalCount })
}
