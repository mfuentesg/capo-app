"use client"

import { useState, useMemo } from "react"
import { Music } from "lucide-react"
import { PlaylistItem } from "./playlist-item"
import type { Playlist } from "@/types"

interface PlaylistListProps {
  playlists: Playlist[]
  searchQuery: string
  onSelectPlaylist: (playlist: Playlist) => void
}

export function PlaylistList({ playlists, searchQuery, onSelectPlaylist }: PlaylistListProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

  const filteredPlaylists = useMemo(() => {
    return playlists.filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (playlist.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )
  }, [searchQuery, playlists])

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    onSelectPlaylist(playlist)
  }

  if (filteredPlaylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Music className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">No playlists found</p>
        <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="p-2 space-y-2">
      {filteredPlaylists.map((playlist) => (
        <PlaylistItem
          key={playlist.id}
          playlist={playlist}
          isSelected={selectedPlaylist?.id === playlist.id}
          onSelect={handleSelectPlaylist}
        />
      ))}
    </div>
  )
}
