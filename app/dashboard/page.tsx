import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/features/auth/api"
import { getTeamsWithClient } from "@/features/teams"
import { rawApi } from "@/features/dashboard"
import DashboardClient from "./dashboard-client"
import { getTranslations } from "@/lib/i18n/translations"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import { SELECTED_TEAM_ID_KEY } from "@/features/app-context/constants"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
}

export default async function DashboardPage() {
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
  const [user, teams, t] = await Promise.all([
    getUser(supabase),
    getTeamsWithClient(supabase, userId),
    getTranslations(locale)
  ])

  if (!user) {
    redirect("/")
  }

  // Determine context
  const initialSelectedTeamId =
    selectedTeamIdCookie && teams.some((team) => team.id === selectedTeamIdCookie)
      ? selectedTeamIdCookie
      : null

  const context = initialSelectedTeamId
    ? { type: "team" as const, teamId: initialSelectedTeamId, userId }
    : { type: "personal" as const, userId }

  // 3. Fetch stats and recent songs based on determined context
  const [initialStats, initialRecentSongs] = await Promise.all([
    rawApi.getDashboardStats(supabase, context).catch(() => ({
      totalSongs: 0,
      totalPlaylists: 0,
      songsThisMonth: 0,
      upcomingPlaylists: 0
    })),
    rawApi.getRecentSongs(supabase, context, 3).catch(() => [])
  ])

  return (
    <DashboardClient
      initialStats={initialStats}
      initialRecentSongs={initialRecentSongs}
      t={t}
    />
  )
}
