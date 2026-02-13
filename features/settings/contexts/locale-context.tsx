"use client"

import {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useMemo,
  type ReactNode
} from "react"
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

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale)
      startTransition(async () => {
        await setLocaleAction(newLocale)
      })
    },
    [startTransition]
  )

  const translations = useMemo(() => getTranslations(locale), [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t: translations }),
    [locale, setLocale, translations]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
