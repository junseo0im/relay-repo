import { fetchPopularAuthors } from "@/lib/queries/author"

export async function GET() {
  const authors = await fetchPopularAuthors(20)
  return Response.json({ authors })
}
