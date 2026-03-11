"use client"

import { useTheme } from "next-themes"
import { useLocale } from "@/features/settings"
import { Label } from "@/components/ui/label"

const THEMES = ["light", "dark", "system"] as const
type Theme = (typeof THEMES)[number]

const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System"
}

export function ThemeSettings() {
  const { t } = useLocale()
  const { theme, setTheme } = useTheme()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{t.settings.appearance}</h2>
        <p className="text-sm text-muted-foreground">{t.settings.themeDescription}</p>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label={t.settings.theme}>
        {THEMES.map((option) => (
          <Label
            key={option}
            className={`flex cursor-pointer select-none items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              theme === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={option}
              checked={theme === option}
              onChange={() => setTheme(option)}
              className="sr-only"
            />
            {THEME_LABELS[option]}
          </Label>
        ))}
      </div>
    </section>
  )
}
