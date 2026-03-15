import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getTeamsWithClient } from "@/features/teams"
import { PlaylistsClient, rawApi as playlistsApi } from "@/features/playlists"
import { getTranslations } from "@/lib/i18n/translations"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"

export const metadata: Metadata = {
  title: "Playlists",
  robots: { index: false, follow: false }
}

export default async function PlaylistsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // 1. Get user first (verified, secure)
  const {
    data: { user: authUser }
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/")
  }

  const userId = authUser.id
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  // 2. Fetch everything else in parallel
  const [teams, t] = await Promise.all([
    getTeamsWithClient(supabase, userId),
    getTranslations(locale)
  ])

  // 3. Fetch playlists from all buckets (matches client default viewFilter: "all")
  const teamIds = teams.map((t) => t.id)
  const initialPlaylists = await playlistsApi.getPlaylistsAllBuckets(supabase, userId, teamIds).catch(() => [])

  return <PlaylistsClient initialPlaylists={initialPlaylists} t={t} />
}
