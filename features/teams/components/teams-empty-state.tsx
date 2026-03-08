"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Plus } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface TeamsEmptyStateProps {
  searchQuery: string
}

export function TeamsEmptyState({ searchQuery }: TeamsEmptyStateProps) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/20 mb-4">
          <Building2 className="h-6 w-6 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t.teams.noTeamsFound}</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
          {searchQuery ? t.common.tryDifferentSearch : t.teams.createNewTeamDescription}
        </p>
        {!searchQuery && (
          <Button asChild>
            <Link href="/dashboard/teams/new">
              <Plus className="mr-2 h-4 w-4" />
              {t.teams.createTeam}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
