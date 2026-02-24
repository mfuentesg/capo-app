"use client"

import { useUpdateSong } from "@/features/songs"
import { LyricsView } from "@/features/lyrics-editor"
import type { Song } from "@/types"

interface LyricsPageClientProps {
  song: Song
}

export function LyricsPageClient({ song }: LyricsPageClientProps) {
  const { mutate: updateSong, isPending: isSaving } = useUpdateSong()

  const handleSaveLyrics = (lyrics: string) => {
    updateSong({ songId: song.id, updates: { lyrics } })
  }

  return <LyricsView song={song} onSaveLyrics={handleSaveLyrics} isSaving={isSaving} />
}
