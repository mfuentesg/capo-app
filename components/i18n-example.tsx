"use client"

import { useTranslation } from "@/hooks/use-translation"

/**
 * Example component demonstrating i18n usage
 *
 * This component shows:
 * 1. Basic translation usage
 * 2. Translation with parameters
 * 3. Accessing nested translation keys
 */
export function I18nExample() {
  const { t, locale } = useTranslation()

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-semibold">Current Locale: {locale}</h2>
      </div>

      <div>
        <h3 className="font-semibold">Basic translations:</h3>
        <ul className="list-disc pl-6">
          <li>{t.nav.home}</li>
          <li>{t.nav.songs}</li>
          <li>{t.nav.playlists}</li>
          <li>{t.common.loading}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Nested translations:</h3>
        <ul className="list-disc pl-6">
          <li>Settings title: {t.settings.title}</li>
          <li>Language label: {t.settings.language}</li>
          <li>Song artist: {t.songs.artist}</li>
        </ul>
      </div>
    </div>
  )
}
