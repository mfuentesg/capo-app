"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Song } from "@/types"

interface PlaylistDraftContextType {
  playlistDraft: Song[]
  isDraftOpen: boolean
  setIsDraftOpen: (open: boolean) => void
  toggleSongInDraft: (song: Song) => void
  isSongInDraft: (songId: string) => boolean
  clearDraft: () => void
  removeFromDraft: (songId: string) => void
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

  const isSongInDraft = useCallback(
    (songId: string) => playlistDraft.some((s) => s.id === songId),
    [playlistDraft]
  )

  const clearDraft = useCallback(() => {
    setPlaylistDraft([])
  }, [])

  const removeFromDraft = useCallback((songId: string) => {
    setPlaylistDraft((prev) => prev.filter((s) => s.id !== songId))
  }, [])

  return (
    <PlaylistDraftContext.Provider
      value={{
        playlistDraft,
        isDraftOpen,
        setIsDraftOpen,
        toggleSongInDraft,
        isSongInDraft,
        clearDraft,
        removeFromDraft
      }}
    >
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
