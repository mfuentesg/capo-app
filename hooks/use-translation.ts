"use client"

import { useLocale } from "@/features/settings"

export function useTranslation() {
  const { t, locale } = useLocale()
  return { t, locale }
}
