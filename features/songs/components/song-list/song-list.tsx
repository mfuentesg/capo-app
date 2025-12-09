"use client"

import { useMemo } from "react"
import { Music } from "lucide-react"
import { SongItem } from "../song-item"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { Song, GroupBy } from "../../types"
import { usePlaylistDraft } from "@/features/playlist-draft"

interface SongListProps {
  songs: Song[]
  previewSong?: Song | null
  selectedSong?: Song | null
  searchQuery: string
  groupBy: GroupBy
  isCreatingNewSong?: boolean
  onSelectSong: (song: Song) => void
}

export function SongList({
  songs,
  previewSong,
  selectedSong,
  searchQuery,
  groupBy,
  isCreatingNewSong = false,
  onSelectSong
}: SongListProps) {
  const { toggleSongInDraft, isSongInDraft } = usePlaylistDraft()

  const filteredSongs = useMemo(() => {
    const filtered = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filtered
  }, [searchQuery, songs])

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
    onSelectSong(song)
  }

  const hasAnySongs =
    Object.keys(groupedSongs).length > 0 &&
    Object.values(groupedSongs).some((group) => group.length > 0)

  if (!hasAnySongs) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Music />
          </EmptyMedia>
          <EmptyTitle>No songs found</EmptyTitle>
          <EmptyDescription>Try a different search term</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="p-4">
      {/* Preview Song Entry */}
      {previewSong && (
        <div className="mb-6 relative">
          <div className="rounded-xl border-2 border-orange-500 dark:border-orange-600 bg-orange-100/50 dark:bg-orange-900/20 shadow-lg">
            <div className="relative">
              <div className="absolute top-2 right-2 z-20">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-orange-600 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Draft
                </span>
              </div>
              <SongItem
                song={previewSong}
                isSelected={true}
                isInCart={false}
                isPreview={true}
                onSelect={() => {}}
                onToggleCart={() => {}}
              />
            </div>
          </div>
        </div>
      )}

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
                isSelected={!isCreatingNewSong && selectedSong?.id === song.id}
                isInCart={isSongInDraft(song.id)}
                isDisabled={isCreatingNewSong}
                onSelect={handleSelectSong}
                onToggleCart={toggleSongInDraft}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
