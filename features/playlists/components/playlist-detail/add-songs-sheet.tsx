"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Search, Music2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription
} from "@/components/ui/sheet"
import { useSongs } from "@/features/songs"
import { addSongToPlaylistAction } from "../../api/actions"
import { playlistsKeys } from "../../hooks/query-keys"
import { useTranslation } from "@/hooks/use-translation"
import type { Song } from "@/features/songs"

interface AddSongsSheetProps {
  open: boolean
  onClose: () => void
  playlistId: string
  existingSongIds: string[]
}

export function AddSongsSheet({
  open,
  onClose,
  playlistId,
  existingSongIds
}: AddSongsSheetProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: allSongs = [] } = useSongs()
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const existingSet = new Set(existingSongIds)
  const addableSongs = allSongs.filter((s) => !existingSet.has(s.id))

  const filtered = search.trim()
    ? addableSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.artist.toLowerCase().includes(search.toLowerCase())
      )
    : addableSongs

  const addMutation = useMutation({
    mutationFn: async (songIds: string[]) => {
      for (const songId of songIds) {
        await addSongToPlaylistAction(playlistId, songId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: playlistsKeys.detail(playlistId) })
      toast.success(t.toasts.songsAdded)
      setSelectedIds(new Set())
      onClose()
    }
  })

  const toggleSong = (song: Song) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(song.id)) {
        next.delete(song.id)
      } else {
        next.add(song.id)
      }
      return next
    })
  }

  const handleAdd = () => {
    if (selectedIds.size === 0) return
    addMutation.mutate(Array.from(selectedIds))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearch("")
      setSelectedIds(new Set())
      onClose()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{t.playlistDetail.addSongsButton}</SheetTitle>
          <SheetDescription className="sr-only">
            {t.playlistDetail.addSongsDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.playlistDetail.searchSongs}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Music2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {addableSongs.length === 0
                  ? t.playlistDetail.noSongsToAdd
                  : t.playlistDetail.noSongsInPlaylist}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((song) => {
                const isSelected = selectedIds.has(song.id)
                return (
                  <button
                    key={song.id}
                    type="button"
                    className={`flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => toggleSong(song)}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 10 8"
                          className="h-3 w-3 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M1 4l3 3L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{song.title}</p>
                      {song.artist && (
                        <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                      )}
                    </div>
                    {song.key && (
                      <span className="shrink-0 text-xs text-muted-foreground font-mono">
                        {song.key}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <SheetFooter className="border-t px-6 py-4">
          <Button
            className="w-full"
            disabled={selectedIds.size === 0 || addMutation.isPending}
            onClick={handleAdd}
          >
            {selectedIds.size > 0
              ? t.playlistDetail.addSelectedSongs.replace("{count}", String(selectedIds.size))
              : t.playlistDetail.addSongsButton}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
