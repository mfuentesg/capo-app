"use client"

import { ProfileSettings } from "@/features/settings/components/profile-settings"
import { ThemeSettings } from "@/features/settings/components/theme-settings"
import { LanguageSettings } from "@/features/settings/components/language-settings"
import { AccountDangerZone } from "@/features/settings/components/account-danger-zone"
import { useLocale } from "@/features/settings"
import { Separator } from "@/components/ui/separator"

export function SettingsClient() {
  const { t } = useLocale()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">{t.settings.title}</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <ProfileSettings />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
        <ThemeSettings />
        <Separator />
        <LanguageSettings />
      </div>

      <AccountDangerZone />
    </div>
  )
}
