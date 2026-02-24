import { notFound } from "next/navigation"
import { PlaylistShareView } from "@/features/playlist-sharing"
import { api } from "@/features/playlists/api"

export default async function SharedPlaylistPage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  const playlist = await api.getPlaylistByShareCode(shareCode)

  if (!playlist) {
    notFound()
  }

  return <PlaylistShareView playlist={playlist} />
}
