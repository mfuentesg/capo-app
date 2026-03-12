import type React from "react"
import { cookies } from "next/headers"
import { QueryProvider } from "@/components/providers/query-provider"
import { LocaleProvider } from "@/features/settings/contexts"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const initialLocale: Locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  return (
    <QueryProvider initialUser={null}>
      <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
    </QueryProvider>
  )
}
