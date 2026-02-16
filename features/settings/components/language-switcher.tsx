"use client"

import { useLocale } from "@/features/settings"
import { locales, localeNames } from "@/lib/i18n/config"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Languages, Check } from "lucide-react"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"

/**
 * LanguageSwitcher Component
 *
 * A dropdown button that allows users to switch between available languages.
 * Can be placed anywhere in the app (e.g., navbar, footer, settings).
 *
 * @example
 * ```tsx
 * import { LanguageSwitcher } from '@/components/language-switcher';
 *
 * export function MyPage() {
 *   return (
 *     <div>
 *       <LanguageSwitcher />
 *     </div>
 *   );
 * }
 * ```
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale()
  const menuIds = createOverlayIds("settings-language-menu")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          id={menuIds.triggerId}
          aria-controls={menuIds.contentId}
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t.settings.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" id={menuIds.contentId} aria-labelledby={menuIds.triggerId}>
        <DropdownMenuLabel>{t.settings.language}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{localeNames[loc]}</span>
            {locale === loc && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * LanguageSwitcherInline Component
 *
 * An inline language switcher with radio buttons.
 * Better for settings pages or forms.
 *
 * @example
 * ```tsx
 * import { LanguageSwitcherInline } from '@/components/language-switcher';
 *
 * export function SettingsPage() {
 *   return (
 *     <div>
 *       <h2>Language</h2>
 *       <LanguageSwitcherInline />
 *     </div>
 *   );
 * }
 * ```
 */
export function LanguageSwitcherInline() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex flex-col gap-2">
      {locales.map((loc) => (
        <label
          key={loc}
          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
        >
          <input
            type="radio"
            name="language"
            value={loc}
            checked={locale === loc}
            onChange={() => setLocale(loc)}
            className="cursor-pointer"
          />
          <span className="text-sm font-medium">{localeNames[loc]}</span>
        </label>
      ))}
    </div>
  )
}
