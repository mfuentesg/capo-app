import { notFound } from "next/navigation"
import { PlaylistShareView } from "@/features/playlist-sharing"
import { api } from "@/features/playlists/api"

export default async function PublicPlaylistSharePage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  const playlist = await api.getPublicPlaylistByShareCode(shareCode)

  if (!playlist || playlist.visibility !== "public") {
    notFound()
  }

  return <PlaylistShareView playlist={playlist} />
}
