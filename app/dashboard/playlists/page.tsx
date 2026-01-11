import { createClient } from "@/lib/supabase/server"
import { getPlaylistsWithClient, PlaylistsClient } from "@/features/playlists"
import { getAppContextFromCookies } from "@/features/app-context/server"

export default async function PlaylistsPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const context = await getAppContextFromCookies(user.id)
  const playlists = await getPlaylistsWithClient(supabase, context)

  return <PlaylistsClient initialPlaylists={playlists} />
}
