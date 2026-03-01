"use client"

import { useUpdateSong, useUserSongSettings, useEffectiveSongSettings, useUpsertUserSongSettings } from "@/features/songs"
import { LyricsView } from "@/features/lyrics-editor"
import type { Song } from "@/types"

interface LyricsPageClientProps {
  song: Song
}

export function LyricsPageClient({ song }: LyricsPageClientProps) {
  const { mutate: updateSong, isPending: isSaving } = useUpdateSong()
  const { data: userSettings } = useUserSongSettings(song)
  const effectiveSettings = useEffectiveSongSettings(song)
  const { mutate: upsertSettings } = useUpsertUserSongSettings(song)

  // Force LyricsView to remount once user settings have resolved so that
  // useLyricsSettings initializes with the correct personal values.
  const settingsKey = userSettings === undefined ? "loading" : "ready"

  return (
    <LyricsView
      key={settingsKey}
      song={song}
      onSaveLyrics={(lyrics) => updateSong({ songId: song.id, updates: { lyrics } })}
      isSaving={isSaving}
      initialSettings={effectiveSettings}
      onSettingsChange={upsertSettings}
    />
  )
}
