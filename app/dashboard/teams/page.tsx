import type { Metadata } from "next"
import { getSelectedTeamId } from "@/features/app-context/server"
import { TeamsClient, rawApi as teamsApi } from "@/features/teams"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "@/lib/i18n/translations"
import { cookies } from "next/headers"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"

export const metadata: Metadata = {
  title: "Teams",
  robots: { index: false, follow: false }
}

export default async function TeamsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  const [initialTeams, initialSelectedTeamId, t] = await Promise.all([
    teamsApi.getTeams(supabase).catch(() => []),
    getSelectedTeamId(),
    getTranslations(locale)
  ])

  return (
    <TeamsClient
      initialTeams={initialTeams}
      initialSelectedTeamId={initialSelectedTeamId}
      t={t}
    />
  )
}
