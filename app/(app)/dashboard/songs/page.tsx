import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getTeamsWithClient } from "@/features/teams"
import { SongsClient, rawApi as songsApi } from "@/features/songs"
import { getTranslations } from "@/lib/i18n/translations"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"

export const metadata: Metadata = {
  title: "Songs",
  robots: { index: false, follow: false }
}

export default async function SongsPage() {
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

  // 3. Fetch songs from all buckets (matches client default viewFilter: "all")
  const teamIds = teams.map((t) => t.id)
  const teamsMeta = teams.map((t) => ({ id: t.id, name: t.name, icon: t.icon ?? null }))
  const initialSongs = await songsApi.getSongsAllBuckets(supabase, userId, teamIds, teamsMeta).catch(() => [])

  return <SongsClient initialSongs={initialSongs} t={t} />
}
