"use client"

import {
  ProfileSettings,
  ThemeSettings,
  LanguageSettings,
  AccountDangerZone,
  ChordHandSettings,
  useLocale
} from "@/features/settings"
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
        <Separator />
        <ChordHandSettings />
      </div>

      <AccountDangerZone />
    </div>
  )
}
