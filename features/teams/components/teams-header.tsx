"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Mail } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export function TeamsHeader() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.teams.title}</h1>
        <p className="text-muted-foreground">{t.teams.manageTeams}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/invitations">
            <Mail className="mr-2 h-4 w-4" />
            {t.nav.invitations}
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            {t.teams.createTeam}
          </Link>
        </Button>
      </div>
    </div>
  )
}
