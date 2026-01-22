"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { teamsKeys } from "@/features/teams/hooks/query-keys"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { useTranslation } from "@/hooks/use-translation"
import type { Tables } from "@/lib/supabase/database.types"
import { TeamsHeader } from "@/features/teams/components/teams-header"
import { TeamsSearch } from "@/features/teams/components/teams-search"
import { TeamCard } from "@/features/teams/components/team-card"
import { TeamsEmptyState } from "@/features/teams/components/teams-empty-state"
import { toast } from "sonner"
import { api } from "@/features/teams"

interface TeamsClientProps {
  initialTeams: Tables<"teams">[]
  initialSelectedTeamId?: string | null
}

export function TeamsClient({ initialTeams, initialSelectedTeamId = null }: TeamsClientProps) {
  const { data: user } = useUser()
  const { switchToTeam } = useAppContext()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: teams = initialTeams } = useQuery({
    queryKey: teamsKeys.list(),
    queryFn: async () => await api.getTeams(),
    enabled: !!user?.id,
    initialData: initialTeams,
    staleTime: 5 * 60 * 1000
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Handle switching to a team from query parameter
  useEffect(() => {
    const switchToTeamId = searchParams.get("switchToTeamId")
    if (switchToTeamId && user?.id && teams.length > 0) {
      // Check if the team exists in the teams list
      const team = teams.find((t) => t.id === switchToTeamId)
      if (team) {
        switchToTeam(switchToTeamId)
        toast.success(t.toasts.teamSwitched.replace("{name}", team.name))
        // Remove query parameter from URL
        router.replace("/dashboard/teams")
      }
    }
  }, [searchParams, user?.id, teams, switchToTeam, router, t])

  const filteredTeams = useMemo(
    () => teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [teams, searchQuery]
  )

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <TeamsHeader />
        <TeamsSearch value={searchQuery} onChange={setSearchQuery} />

        {filteredTeams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} initialSelectedTeamId={initialSelectedTeamId} />
            ))}
          </div>
        ) : (
          <TeamsEmptyState searchQuery={searchQuery} />
        )}
      </div>
    </div>
  )
}
