"use client"

import { useQuery } from "@tanstack/react-query"
import { getTeamMembers, teamsKeys } from "@/features/teams"
import { useUser } from "@/features/auth"
import type { Tables } from "@/lib/supabase/database.types"
import { TeamDetailHeader } from "@/features/teams/components/team-detail-header"
import { TeamInfoSection } from "@/features/teams/components/team-info-section"
import { TeamMembersSection } from "@/features/teams/components/team-members-section"
import { TeamDangerZone } from "@/features/teams/components/team-danger-zone"

interface TeamDetailClientProps {
  initialTeam: Tables<"teams">
  initialMembers: Tables<"team_members">[]
}

export function TeamDetailClient({ initialTeam, initialMembers }: TeamDetailClientProps) {
  const { data: user } = useUser()

  const { data: members } = useQuery({
    queryKey: teamsKeys.members(initialTeam.id),
    queryFn: () => getTeamMembers(initialTeam.id),
    initialData: initialMembers,
    staleTime: 30 * 1000
  })

  const isOwner = user?.id === initialTeam.created_by

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <TeamDetailHeader team={initialTeam} />
        <TeamInfoSection team={initialTeam} />
        <TeamMembersSection members={members || []} isOwner={isOwner} teamId={initialTeam.id} />
        {isOwner && <TeamDangerZone />}
      </div>
    </div>
  )
}
