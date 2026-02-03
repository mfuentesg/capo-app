"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"
import type { Song } from "@/features/songs"

export interface PlaylistDraftContextType {
  playlistDraft: Song[]
  isDraftOpen: boolean
  setIsDraftOpen: (open: boolean) => void
  toggleSongInDraft: (song: Song) => void
  isSongInDraft: (songId: string) => boolean
  clearDraft: () => void
  removeFromDraft: (songId: string) => void
  reorderDraft: (sourceIndex: number, destinationIndex: number) => void
}

const PlaylistDraftContext = createContext<PlaylistDraftContextType | undefined>(undefined)

export function PlaylistDraftProvider({ children }: { children: ReactNode }) {
  const [playlistDraft, setPlaylistDraft] = useState<Song[]>([])
  const [isDraftOpen, setIsDraftOpen] = useState(false)

  const toggleSongInDraft = useCallback((song: Song) => {
    setPlaylistDraft((prev) => {
      const exists = prev.some((s) => s.id === song.id)
      if (exists) {
        return prev.filter((s) => s.id !== song.id)
      }
      return [...prev, song]
    })
  }, [])

  const draftIds = useMemo(() => new Set(playlistDraft.map((s) => s.id)), [playlistDraft])

  const isSongInDraft = useCallback((songId: string) => draftIds.has(songId), [draftIds])

  const clearDraft = useCallback(() => {
    setPlaylistDraft([])
  }, [])

  const removeFromDraft = useCallback((songId: string) => {
    setPlaylistDraft((prev) => prev.filter((s) => s.id !== songId))
  }, [])

  const reorderDraft = useCallback((sourceIndex: number, destinationIndex: number) => {
    setPlaylistDraft((prev) => {
      const result = Array.from(prev)
      const [removed] = result.splice(sourceIndex, 1)
      result.splice(destinationIndex, 0, removed)
      return result
    })
  }, [])

  const value = useMemo(
    () => ({
      playlistDraft,
      isDraftOpen,
      setIsDraftOpen,
      toggleSongInDraft,
      isSongInDraft,
      clearDraft,
      removeFromDraft,
      reorderDraft
    }),
    [
      playlistDraft,
      isDraftOpen,
      toggleSongInDraft,
      isSongInDraft,
      clearDraft,
      removeFromDraft,
      reorderDraft
    ]
  )

  return (
    <PlaylistDraftContext.Provider value={value}>
      {children}
    </PlaylistDraftContext.Provider>
  )
}

export function usePlaylistDraft() {
  const context = useContext(PlaylistDraftContext)
  if (context === undefined) {
    throw new Error("usePlaylistDraft must be used within a PlaylistDraftProvider")
  }
  return context
}
