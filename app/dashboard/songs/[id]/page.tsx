import { api } from "@/features/songs/api"
import { getUserSongSettingsAction } from "@/features/songs/api/actions"
import { notFound } from "next/navigation"
import { LyricsPageClient } from "./lyrics-page-client"

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [song, initialUserSettings] = await Promise.all([
    api.getSong(id),
    getUserSongSettingsAction(id).catch(() => null)
  ])

  if (!song) {
    notFound()
  }

  return <LyricsPageClient song={song} initialUserSettings={initialUserSettings} />
}
