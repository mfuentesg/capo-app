import { redirect } from "next/navigation"
import { getAppContext } from "@/features/app-context/server"
import { api, PlaylistsClient } from "@/features/playlists"

export default async function PlaylistsPage() {
  const context = await getAppContext()
  if (!context) {
    redirect("/")
  }
  const playlists = await api.getPlaylists(context)

  return <PlaylistsClient initialPlaylists={playlists} />
}
