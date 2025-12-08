"use client"

import { createContext, useContext, useState } from "react"
import type { Locale } from "@/lib/i18n/config"
import { defaultLocale } from "@/lib/i18n/config"
import { getTranslations } from "@/lib/i18n/translations"

const LOCALE_COOKIE_NAME = "NEXT_LOCALE"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export function LocaleProvider({
  children,
  initialLocale = defaultLocale
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  // Use initialLocale from server-side cookie reading
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocaleCookie(newLocale)
  }

  const translations = getTranslations(locale)

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
