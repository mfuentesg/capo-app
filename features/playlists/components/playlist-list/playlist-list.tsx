"use client"

import { useMemo } from "react"
import { ListMusic } from "lucide-react"
import { PlaylistItem } from "../playlist-item"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { Playlist } from "@/features/playlists/types"
import { useTranslation } from "@/hooks/use-translation"

interface PlaylistListProps {
  playlists: Playlist[]
  searchQuery: string
  filterStatus: "all" | "drafts" | "completed"
  filterVisibility?: "all" | "public" | "private"
  selectedPlaylistId?: string | null
  onSelectPlaylist: (playlist: Playlist) => void
}

export function PlaylistList({
  playlists,
  searchQuery,
  filterStatus,
  filterVisibility = "all",
  selectedPlaylistId = null,
  onSelectPlaylist
}: PlaylistListProps) {
  const { t } = useTranslation()

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

  if (filteredPlaylists.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListMusic />
          </EmptyMedia>
          <EmptyTitle>{t.playlists.noPlaylists}</EmptyTitle>
          <EmptyDescription>{t.common.tryDifferentSearch}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="p-2 space-y-2">
      {filteredPlaylists.map((playlist) => (
        <PlaylistItem
          key={playlist.id}
          playlist={playlist}
          isSelected={selectedPlaylistId === playlist.id}
          onSelect={onSelectPlaylist}
        />
      ))}
    </div>
  )
}
