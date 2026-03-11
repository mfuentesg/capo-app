"use client"

import { useLocale } from "@/features/settings"
import { locales, localeNames } from "@/lib/i18n/config"
import { Label } from "@/components/ui/label"

export function LanguageSettings() {
  const { t, locale, setLocale } = useLocale()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t.settings.language}</h2>
        <p className="text-sm text-muted-foreground">{t.settings.languageDescription}</p>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={t.settings.language}>
        {locales.map((loc) => (
          <Label
            key={loc}
            className={`flex cursor-pointer select-none items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              locale === loc
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <input
              type="radio"
              name="language"
              value={loc}
              checked={locale === loc}
              onChange={() => setLocale(loc)}
              className="sr-only"
            />
            {localeNames[loc]}
          </Label>
        ))}
      </div>
    </section>
  )
}
