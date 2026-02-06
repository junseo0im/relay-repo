import { createClient } from "@/lib/supabase/server"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { ProfileContent } from "@/components/profile/ProfileContent"
import {
  fetchMyProfile,
  fetchParticipatedStories,
  fetchLikedStories,
} from "@/lib/queries/profile"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <RequireAuth>
        <div />
      </RequireAuth>
    )
  }

  const [profile, participatedStories, likedStories] = await Promise.all([
    fetchMyProfile(user.id),
    fetchParticipatedStories(user.id),
    fetchLikedStories(user.id),
  ])

  if (!profile) {
    return (
      <RequireAuth>
        <div className="min-h-[40vh] flex items-center justify-center">
          <p className="text-muted-foreground">프로필을 불러올 수 없습니다.</p>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <ProfileContent
        profile={profile}
        email={user.email ?? undefined}
        participatedStories={participatedStories}
        likedStories={likedStories}
      />
    </RequireAuth>
  )
}
