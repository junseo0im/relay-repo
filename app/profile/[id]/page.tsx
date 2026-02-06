import { notFound } from "next/navigation"
import {
  fetchAuthorProfile,
  fetchAuthorParticipatedStories,
} from "@/lib/queries/profile"
import { AuthorProfileContent } from "@/components/profile/AuthorProfileContent"

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [author, participatedStories] = await Promise.all([
    fetchAuthorProfile(id),
    fetchAuthorParticipatedStories(id),
  ])

  if (!author) {
    notFound()
  }

  return (
    <AuthorProfileContent
      author={author}
      participatedStories={participatedStories}
    />
  )
}
