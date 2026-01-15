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
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t.teams.noTeamsFound}</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
          {searchQuery
            ? t.common.tryDifferentSearch
            : t.teams.createNewTeamDescription}
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
