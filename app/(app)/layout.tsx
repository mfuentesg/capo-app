import type React from "react"
import { cookies } from "next/headers"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthStateProvider } from "@/features/auth/contexts"
import { AppContextProvider } from "@/features/app-context"
import { LocaleProvider, ChordHandProvider } from "@/features/settings/contexts"
import type { ChordHand } from "@/lib/actions/chord-hand"
import { getInitialAppContextData } from "@/features/app-context/server"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"

export default async function AppLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const appContextData = await getInitialAppContextData()

  const cookieStore = await cookies()

  // DB locale takes priority; cookie is fallback for unauthenticated edge cases
  const dbLocale = appContextData.preferences?.locale
  let initialLocale: Locale
  if (dbLocale && isValidLocale(dbLocale)) {
    initialLocale = dbLocale
  } else {
    const localeCookie = cookieStore.get("NEXT_LOCALE")
    initialLocale =
      localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale
  }

  // Chord hand: DB takes priority, then cookie, then default ("left")
  const dbChordHand = appContextData.preferences?.chordHand
  let initialChordHand: ChordHand
  if (dbChordHand === "right" || dbChordHand === "left") {
    initialChordHand = dbChordHand
  } else {
    const chordHandCookie = cookieStore.get("NEXT_CHORD_HAND")
    initialChordHand = chordHandCookie?.value === "right" ? "right" : "left"
  }

  return (
    <QueryProvider initialUser={appContextData.user}>
      <AuthStateProvider>
        <AppContextProvider
          initialSelectedTeamId={appContextData.initialSelectedTeamId}
          initialTeams={appContextData.teams}
          initialUser={appContextData.user}
          initialViewFilter={appContextData.initialViewFilter}
        >
          <LocaleProvider initialLocale={initialLocale}>
          <ChordHandProvider initialChordHand={initialChordHand}>{children}</ChordHandProvider>
        </LocaleProvider>
        </AppContextProvider>
      </AuthStateProvider>
    </QueryProvider>
  )
}
