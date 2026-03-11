"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/features/settings"
import { deleteAccountAction } from "@/features/settings/api/actions"

export function AccountDangerZone() {
  const { t } = useLocale()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAccountAction()
    })
  }

  return (
    <section className="space-y-4 rounded-lg border border-destructive/50 p-6">
      <div>
        <h2 className="text-base font-semibold text-destructive">
          {t.settings.dangerZone}
        </h2>
        <p className="text-sm text-muted-foreground">{t.settings.dangerZoneDescription}</p>
      </div>
      {!confirming ? (
        <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
          {t.settings.deleteAccount}
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium">{t.settings.deleteAccountConfirm}</p>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
              {isPending ? t.settings.deleteAccountPending : t.settings.deleteAccountConfirmButton}
            </Button>
            <Button variant="ghost" size="sm" disabled={isPending} onClick={() => setConfirming(false)}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
