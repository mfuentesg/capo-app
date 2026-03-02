import { api } from "@/features/songs/api"
import { getUserProfileDataAction } from "@/features/songs/api/actions"
import { notFound } from "next/navigation"
import { LyricsPageClient } from "./lyrics-page-client"

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [song, profileData] = await Promise.all([
    api.getSong(id),
    getUserProfileDataAction().catch(() => null)
  ])

  if (!song) {
    notFound()
  }

  const initialUserSettings = profileData?.songSettings.find((s) => s.songId === id) ?? null

  return (
    <LyricsPageClient
      song={song}
      initialUserSettings={initialUserSettings}
      initialMinimalistView={profileData?.preferences.minimalistLyricsView ?? false}
    />
  )
}
