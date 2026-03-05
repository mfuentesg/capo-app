import type { Metadata } from "next"
import { api } from "@/features/songs/api"
import { getUserProfileDataAction } from "@/features/songs/api/actions"
import { notFound } from "next/navigation"
import { LyricsPageClient } from "./lyrics-page-client"

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const song = await api.getSong(id)

  if (!song) {
    return { title: "Song Not Found", robots: { index: false, follow: false } }
  }

  return {
    title: `${song.title} — ${song.artist}`,
    robots: { index: false, follow: false }
  }
}

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
      initialLyricsColumns={profileData?.preferences.lyricsColumns ?? 2}
    />
  )
}
