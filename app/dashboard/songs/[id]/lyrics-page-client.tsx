"use client"

import {
  useUpdateSong,
  useUserSongSettings,
  useEffectiveSongSettings,
  useUpsertUserSongSettings
} from "@/features/songs"
import { LyricsView } from "@/features/lyrics-editor"
import type { Song } from "@/types"
import type { UserSongSettings } from "@/features/songs"

interface LyricsPageClientProps {
  song: Song
  initialUserSettings: UserSongSettings | null
}

export function LyricsPageClient({ song, initialUserSettings }: LyricsPageClientProps) {
  const { mutate: updateSong, isPending: isSaving } = useUpdateSong()
  useUserSongSettings(song, initialUserSettings)
  const effectiveSettings = useEffectiveSongSettings(song)
  const { mutate: upsertSettings } = useUpsertUserSongSettings(song)

  return (
    <LyricsView
      song={song}
      onSaveLyrics={(lyrics) => updateSong({ songId: song.id, updates: { lyrics } })}
      isSaving={isSaving}
      initialSettings={effectiveSettings}
      onSettingsChange={upsertSettings}
    />
  )
}
