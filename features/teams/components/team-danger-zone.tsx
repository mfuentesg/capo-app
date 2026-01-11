"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface TeamDangerZoneProps {
  onDelete?: () => void
}

export function TeamDangerZone({ onDelete }: TeamDangerZoneProps) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg border border-destructive/50 bg-card p-6">
      <h2 className="text-lg font-semibold text-destructive mb-4">{t.account.dangerZone}</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t.teams.deleteTeam}</p>
            <p className="text-xs text-muted-foreground">
              {t.teams.deleteTeamDescription}
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled={!onDelete} onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t.teams.deleteTeam}
          </Button>
        </div>
      </div>
    </div>
  )
}
