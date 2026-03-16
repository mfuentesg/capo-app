import type { Metadata } from "next"
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

  const {
    data: { user: authUser }
  } = await supabase.auth.getUser()

  if (!authUser) {
    const { redirect } = await import("next/navigation")
    redirect("/")
  }

  const [initialTeams, t] = await Promise.all([
    teamsApi.getTeams(supabase).catch(() => []),
    getTranslations(locale)
  ])

  return <TeamsClient initialTeams={initialTeams} t={t} />
}
