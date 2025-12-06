"use client"

import { PlaylistsClient } from "@/components/playlists-client"
import { usePlaylists } from "@/contexts/playlists-context"

export default function PlaylistsPage() {
  const { playlists, updatePlaylist, deletePlaylist } = usePlaylists()

  return (
    <PlaylistsClient
      initialPlaylists={playlists}
      onUpdatePlaylist={updatePlaylist}
      onDeletePlaylist={deletePlaylist}
    />
  )
}
