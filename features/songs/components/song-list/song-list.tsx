"use client"

import { useMemo } from "react"
import { Music } from "lucide-react"
import { SongItem } from "@/features/songs"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { Song, SongListProps } from "@/features/songs/types"
import { usePlaylistDraft } from "@/features/playlist-draft"
import { useTranslation } from "@/hooks/use-translation"

export function SongList({
  songs,
  previewSong,
  selectedSong,
  searchQuery,
  groupBy,
  filterStatus,
  bpmRange,
  isCreatingNewSong = false,
  onSelectSong
}: SongListProps) {
  const { toggleSongInDraft, isSongInDraft } = usePlaylistDraft()
  const { t } = useTranslation()

  const filteredSongs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const filtered = songs.filter((song) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery)

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "drafts" ? song.isDraft === true : song.isDraft !== true)

      const bpm = song.bpm ?? 0
      const matchesBpm =
        bpmRange === "all" ||
        (bpmRange === "slow"
          ? bpm < 100
          : bpmRange === "medium"
            ? bpm >= 100 && bpm <= 140
            : bpm > 140)

      return matchesSearch && matchesStatus && matchesBpm
    })

    return filtered
  }, [bpmRange, filterStatus, searchQuery, songs])

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
          <EmptyTitle>{t.songs.noSongs}</EmptyTitle>
          <EmptyDescription>{t.common.tryDifferentSearch}</EmptyDescription>
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
                  {t.playlists.draft}
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
