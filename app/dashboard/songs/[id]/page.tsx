import type { Metadata } from "next"
import { getSong as getSongApi } from "@/features/songs/api"
import { getUserProfileData as getUserProfileDataApi } from "@/features/songs/api/user-preferences-api"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { LyricsPageClient } from "./lyrics-page-client"

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const song = await getSongApi(supabase, id)

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
  const supabase = await createClient()

  // 1. Get user first (verified, secure)
  const {
    data: { user: authUser }
  } = await supabase.auth.getUser()

  // 2. Fetch song and profile data in parallel
  const [song, profileData] = await Promise.all([
    getSongApi(supabase, id),
    authUser ? getUserProfileDataApi(supabase, authUser.id).catch(() => null) : Promise.resolve(null)
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
