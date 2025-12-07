"use client"

import { useState, useMemo } from "react"
import { ListMusic } from "lucide-react"
import { PlaylistItem } from "./playlist-item"
import type { Playlist } from "@/types"

interface PlaylistListProps {
  playlists: Playlist[]
  searchQuery: string
  filterStatus: "all" | "drafts" | "completed"
  filterVisibility?: "all" | "public" | "private"
  onSelectPlaylist: (playlist: Playlist) => void
}

export function PlaylistList({
  playlists,
  searchQuery,
  filterStatus,
  filterVisibility = "all",
  onSelectPlaylist
}: PlaylistListProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

  const filteredPlaylists = useMemo(() => {
    let filtered = playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply status filter
    if (filterStatus === "drafts") {
      filtered = filtered.filter((playlist) => playlist.isDraft === true)
    } else if (filterStatus === "completed") {
      filtered = filtered.filter((playlist) => !playlist.isDraft)
    }

    // Apply visibility filter
    if (filterVisibility === "public") {
      filtered = filtered.filter((playlist) => playlist.visibility === "public")
    } else if (filterVisibility === "private") {
      filtered = filtered.filter((playlist) => playlist.visibility === "private")
    }

    return filtered
  }, [searchQuery, playlists, filterStatus, filterVisibility])

  const handleSelectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    onSelectPlaylist(playlist)
  }

  if (filteredPlaylists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ListMusic className="h-5 w-5 text-muted-foreground" />
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
