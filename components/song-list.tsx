"use client"

import { useState, useMemo } from "react"
import { Music } from "lucide-react"
import { SongItem } from "./song-item"
import { PlaylistDraft } from "./playlist-draft"
import type { Song, GroupBy } from "@/types"
import { usePlaylistDraft } from "@/contexts/playlist-draft-context"
import { useTranslation } from "@/hooks/use-translation"

interface SongListProps {
  songs: Song[]
  searchQuery: string
  groupBy: GroupBy
  filterStatus: "all" | "drafts" | "completed"
  onSelectSong: (song: Song) => void
}

export function SongList({
  songs,
  searchQuery,
  groupBy,
  filterStatus,
  onSelectSong
}: SongListProps) {
  const { t } = useTranslation()
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const {
    playlistDraft,
    isDraftOpen,
    setIsDraftOpen,
    toggleSongInDraft,
    isSongInDraft,
    clearDraft,
    removeFromDraft,
    reorderDraft
  } = usePlaylistDraft()

  const filteredSongs = useMemo(() => {
    let filtered = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply status filter
    if (filterStatus === "drafts") {
      filtered = filtered.filter((song) => song.isDraft === true)
    } else if (filterStatus === "completed") {
      filtered = filtered.filter((song) => !song.isDraft)
    }

    return filtered
  }, [searchQuery, songs, filterStatus])

  const groupedSongs = useMemo(() => {
    if (groupBy === "none") {
      return { "All Songs": filteredSongs }
    }

    return filteredSongs.reduce(
      (groups, song) => {
        const groupKey = groupBy === "key" ? song.key : song.artist
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(song)
        return groups
      },
      {} as Record<string, Song[]>
    )
  }, [filteredSongs, groupBy])

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedSongs).sort((a, b) => a.localeCompare(b))
  }, [groupedSongs])

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song)
    onSelectSong(song)
  }

  const hasAnySongs =
    Object.keys(groupedSongs).length > 0 &&
    Object.values(groupedSongs).some((group) => group.length > 0)

  if (!hasAnySongs) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Music className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">No songs found</p>
        <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
      </div>
    )
  }

  return (
    <>
      <PlaylistDraft
        songs={playlistDraft}
        isOpen={isDraftOpen}
        onOpenChange={setIsDraftOpen}
        onClear={clearDraft}
        onRemove={removeFromDraft}
        onReorder={reorderDraft}
      />
      <div className="p-4">
        {sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="mb-6">
            {groupBy !== "none" && (
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupKey}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({groupedSongs[groupKey].length})
                </span>
              </div>
            )}
            <div className="space-y-3">
              {groupedSongs[groupKey].map((song) => (
                <SongItem
                  key={song.id}
                  song={song}
                  isSelected={selectedSong?.id === song.id}
                  isInCart={isSongInDraft(song.id)}
                  onSelect={handleSelectSong}
                  onToggleCart={toggleSongInDraft}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
