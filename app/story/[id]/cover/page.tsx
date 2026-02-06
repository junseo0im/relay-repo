import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CoverGenerationPage } from "./CoverGenerationPage"

export default async function StoryCoverPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: room } = await supabase
    .from("story_rooms")
    .select("id, title, genre, is_completed, cover_image, created_by")
    .eq("id", id)
    .single()

  if (!room) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!room.is_completed) {
    redirect(`/story/${id}`)
  }

  if (room.created_by !== user?.id) {
    redirect(`/story/${id}`)
  }

  return (
    <CoverGenerationPage
      roomId={room.id}
      title={room.title}
      genre={room.genre}
      initialCoverImage={room.cover_image ?? undefined}
    />
  )
}
