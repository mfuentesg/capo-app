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
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const initialLocale: Locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  const appContextData = await getInitialAppContextData()

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
