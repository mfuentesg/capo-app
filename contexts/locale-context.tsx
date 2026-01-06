"use client"

import { createContext, useContext, useState, useTransition, type ReactNode } from "react"
import type { Locale } from "@/lib/i18n/config"
import { defaultLocale } from "@/lib/i18n/config"
import { getTranslations } from "@/lib/i18n/translations"
import { setLocaleAction } from "@/lib/actions/locale"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({
  children,
  initialLocale = defaultLocale
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [, startTransition] = useTransition()

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    startTransition(async () => {
      await setLocaleAction(newLocale)
    })
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
