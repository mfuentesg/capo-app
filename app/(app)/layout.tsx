import type React from "react"
import { cookies } from "next/headers"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthStateProvider } from "@/features/auth/contexts"
import { AppContextProvider } from "@/features/app-context"
import { LocaleProvider } from "@/features/settings/contexts"
import { getInitialAppContextData } from "@/features/app-context/server"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"

export default async function AppLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const appContextData = await getInitialAppContextData()

  // DB locale takes priority; cookie is fallback for unauthenticated edge cases
  const dbLocale = appContextData.preferences?.locale
  let initialLocale: Locale
  if (dbLocale && isValidLocale(dbLocale)) {
    initialLocale = dbLocale
  } else {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get("NEXT_LOCALE")
    initialLocale =
      localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale
  }

  return (
    <QueryProvider initialUser={appContextData.user}>
      <AuthStateProvider>
        <AppContextProvider
          initialSelectedTeamId={appContextData.initialSelectedTeamId}
          initialTeams={appContextData.teams}
          initialUser={appContextData.user}
        >
          <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
        </AppContextProvider>
      </AuthStateProvider>
    </QueryProvider>
  )
}
