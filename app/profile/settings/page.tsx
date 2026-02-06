import { createClient } from "@/lib/supabase/server"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm"
import { fetchMyProfile } from "@/lib/queries/profile"

export default async function ProfileSettingsPage() {
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

  const profile = await fetchMyProfile(user.id)

  return (
    <RequireAuth>
      <ProfileSettingsForm
        initialDisplayName={profile?.displayName ?? "사용자"}
        initialAvatarUrl={profile?.avatarUrl ?? ""}
        initialBio={profile?.bio ?? ""}
        initialPreferredGenres={profile?.preferredGenres ?? []}
      />
    </RequireAuth>
  )
}
