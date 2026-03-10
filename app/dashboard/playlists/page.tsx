import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getTeamsWithClient } from "@/features/teams"
import { PlaylistsClient, rawApi as playlistsApi } from "@/features/playlists"
import { getTranslations } from "@/lib/i18n/translations"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import { SELECTED_TEAM_ID_KEY } from "@/features/app-context/constants"

export const metadata: Metadata = {
  title: "Playlists",
  robots: { index: false, follow: false }
}

export default async function PlaylistsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // 1. Get session first (fastest)
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect("/")
  }

  const userId = session.user.id
  const selectedTeamIdCookie = cookieStore.get(SELECTED_TEAM_ID_KEY)?.value
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  // 2. Fetch everything else in parallel
  const [teams, t] = await Promise.all([
    getTeamsWithClient(supabase, userId),
    getTranslations(locale)
  ])

  // Determine context
  const initialSelectedTeamId =
    selectedTeamIdCookie && teams.some((team) => team.id === selectedTeamIdCookie)
      ? selectedTeamIdCookie
      : null

  const context = initialSelectedTeamId
    ? { type: "team" as const, teamId: initialSelectedTeamId, userId }
    : { type: "personal" as const, userId }

  // 3. Fetch playlists
  const initialPlaylists = await playlistsApi.getPlaylists(supabase, context).catch(() => [])

  return <PlaylistsClient initialPlaylists={initialPlaylists} t={t} />
}
