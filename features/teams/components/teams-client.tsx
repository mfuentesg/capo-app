"use client"

import { useState, useMemo, useEffect } from "react"
import { useDebounce } from "@uidotdev/usehooks"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { teamsKeys } from "../hooks/query-keys"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { useTranslation } from "@/hooks/use-translation"
import { TeamsHeader } from "@/features/teams"
import { TeamsSearch } from "@/features/teams"
import { TeamCard } from "@/features/teams"
import { TeamsEmptyState } from "@/features/teams"
import { toast } from "sonner"
import { api } from "@/features/teams"

interface TeamsClientProps {
  initialSelectedTeamId?: string | null
}

export function TeamsClient({ initialSelectedTeamId = null }: TeamsClientProps) {
  const { data: user } = useUser()
  const { switchToTeam } = useAppContext()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: teams = [] } = useQuery({
    queryKey: teamsKeys.list(),
    queryFn: async () => await api.getTeams(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  })
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

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
    () =>
      teams.filter((team) => team.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())),
    [teams, debouncedSearchQuery]
  )

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <TeamsHeader />
        <TeamsSearch value={searchQuery} onChange={setSearchQuery} />

        {filteredTeams.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                memberCount={team.member_count}
                initialSelectedTeamId={initialSelectedTeamId}
              />
            ))}
          </div>
        ) : (
          <TeamsEmptyState searchQuery={searchQuery} />
        )}
      </div>
    </div>
  )
}
