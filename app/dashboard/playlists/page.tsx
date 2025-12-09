"use client"

import { PlaylistsClient } from "@/features/playlists"
import { usePlaylists } from "@/features/playlists"

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
