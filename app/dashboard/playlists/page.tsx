import { api, PlaylistsClient } from "@/features/playlists"
import { getAppContext } from "@/features/app-context/server"

export default async function PlaylistsPage() {
  const context = await getAppContext()
  const playlists = await api.getPlaylists(context)

  return <PlaylistsClient initialPlaylists={playlists} />
}
