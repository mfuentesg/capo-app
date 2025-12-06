"use client"

import { useLocale } from "@/contexts/locale-context"

export function useTranslation() {
  const { t, locale } = useLocale()
  return { t, locale }
}
