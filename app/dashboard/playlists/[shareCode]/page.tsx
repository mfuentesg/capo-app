import { notFound } from "next/navigation"
import { PlaylistShareView } from "@/features/playlist-sharing"
import { api } from "@/features/playlists/api"
import type { Playlist } from "@/features/playlists/types"

export default async function PlaylistSharePage({
  params
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = await params
  const playlistWithSongs = await api.getPublicPlaylistByShareCode(shareCode)

  if (!playlistWithSongs || playlistWithSongs.visibility !== "public") {
    notFound()
  }

  const playlist: Playlist = {
    ...playlistWithSongs,
    songs: playlistWithSongs.songs.map((song) => song.id)
  }

  return <PlaylistShareView playlist={playlist} />
}
