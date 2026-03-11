import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { rawApi as dashboardApi } from "@/features/dashboard"
import DashboardClient from "./dashboard-client"
import { getTranslations } from "@/lib/i18n/translations"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import { getInitialAppContextData } from "@/features/app-context/server"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  // 1. Get cached app context (user, teams, selected team)
  // This call is now cached via React cache() in RootLayout, so it incurs 0 extra DB calls here.
  const { user, initialSelectedTeamId } = await getInitialAppContextData()

  if (!user) {
    redirect("/")
  }

  const userId = user.id
  const t = await getTranslations(locale)

  // Determine context
  const context = initialSelectedTeamId
    ? { type: "team" as const, teamId: initialSelectedTeamId, userId }
    : { type: "personal" as const, userId }

  // 2. Fetch stats and recent songs based on determined context
  const [initialStats, initialRecentSongs] = await Promise.all([
    dashboardApi.getDashboardStats(supabase, context).catch(() => ({
      totalSongs: 0,
      totalPlaylists: 0,
      songsThisMonth: 0,
      upcomingPlaylists: 0
    })),
    dashboardApi.getRecentSongs(supabase, context, 3).catch(() => [])
  ])

  return (
    <DashboardClient
      initialStats={initialStats}
      initialRecentSongs={initialRecentSongs}
      t={t}
    />
  )
}
