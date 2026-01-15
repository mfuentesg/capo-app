"use client"

import { useTranslation } from "@/hooks/use-translation"
import type { Tables } from "@/lib/supabase/database.types"
import { formatDate } from "@/lib/utils"

interface TeamInfoSectionProps {
  team: Tables<"teams">
}

export function TeamInfoSection({ team }: TeamInfoSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">{t.teams.teamInformation}</h2>
      <div className="grid gap-4 sm:grid-cols-2">

        <div>
          <p className="text-sm font-medium text-muted-foreground">{t.teams.created}</p>
          <p className="text-sm">{formatDate(team.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
