"use client"

import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { LanguageSettings } from "@/features/settings/components/language-settings"
import { AccountDangerZone } from "@/features/settings/components/account-danger-zone"
import { useLocale } from "@/features/settings"
import { Separator } from "@/components/ui/separator"

export function SettingsClient() {
  const { t } = useLocale()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold">{t.settings.title}</h1>
      <div className="space-y-8">
        <ThemeSettings />
        <Separator />
        <LanguageSettings />
        <Separator />
        <AccountDangerZone />
      </div>
    </div>
  )
}
