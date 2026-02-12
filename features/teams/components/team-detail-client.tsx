"use client"

import { useQuery } from "@tanstack/react-query"
import { teamsKeys } from "../hooks/query-keys"
import { api as teamsApi } from "../api"
import { useUser } from "@/features/auth"
import { useDeleteTeam, useUpdateTeam, useTransferAndLeave } from "../hooks"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { TeamDetailHeader } from "@/features/teams"
import { TeamInfoSection } from "@/features/teams"
import { TeamMembersSection } from "@/features/teams"
import { TeamDangerZone } from "@/features/teams"

interface TeamDetailClientProps {
  initialTeam: Tables<"teams">
  initialMembers: (Tables<"team_members"> & { user_full_name: string | null })[]
  initialInvitations: Tables<"team_invitations">[]
}

export function TeamDetailClient({
  initialTeam,
  initialMembers,
  initialInvitations
}: TeamDetailClientProps) {
  const { data: user } = useUser()
  const deleteTeamMutation = useDeleteTeam()
  const updateTeamMutation = useUpdateTeam()
  const transferAndLeaveMutation = useTransferAndLeave()

  // Use React Query to manage team data for optimistic updates
  const { data: team = initialTeam } = useQuery<
    Tables<"teams">,
    Error,
    Tables<"teams">,
    readonly unknown[]
  >({
    queryKey: teamsKeys.detail(initialTeam.id),
    queryFn: async () => {
      const teamData = await teamsApi.getTeam(initialTeam.id)
      // Ensure we never return null when we have initialData
      return teamData || initialTeam
    },
    initialData: initialTeam,
    staleTime: 30 * 1000
  })

  const { data: members } = useQuery<
    (Tables<"team_members"> & { user_full_name: string | null })[],
    Error,
    (Tables<"team_members"> & { user_full_name: string | null })[],
    readonly unknown[]
  >({
    queryKey: teamsKeys.members(initialTeam.id),
    queryFn: async () => await teamsApi.getTeamMembers(initialTeam.id),
    initialData: initialMembers as (Tables<"team_members"> & { user_full_name: string | null })[],
    staleTime: 30 * 1000
  })

  const { data: invitations } = useQuery<
    Tables<"team_invitations">[],
    Error,
    Tables<"team_invitations">[],
    readonly unknown[]
  >({
    queryKey: teamsKeys.invitations(initialTeam.id),
    queryFn: async () => await teamsApi.getTeamInvitations(initialTeam.id),
    initialData: initialInvitations,
    staleTime: 30 * 1000
  })

  const isOwner = user?.id === team.created_by
  const currentUserRole = members?.find((member) => member.user_id === user?.id)?.role

  const handleUpdate = (updates: TablesUpdate<"teams">) => {
    updateTeamMutation.mutate({ teamId: team.id, updates })
  }

  const handleDelete = () => {
    deleteTeamMutation.mutate(team.id)
  }

  const handleTransferAndLeave = (newOwnerId: string) => {
    transferAndLeaveMutation.mutate({ teamId: team.id, newOwnerId })
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <TeamDetailHeader team={team} onUpdate={handleUpdate} isOwner={isOwner} />
        <TeamInfoSection team={team} />
        <TeamMembersSection
          members={members || []}
          invitations={invitations || []}
          teamId={team.id}
          currentUserId={user?.id}
          currentUserRole={currentUserRole}
        />
        {isOwner && user && (
          <TeamDangerZone
            teamName={team.name}
            members={members || []}
            currentUserId={user.id}
            onDelete={handleDelete}
            onTransferAndLeave={handleTransferAndLeave}
            isDeleting={deleteTeamMutation.isPending}
            isTransferring={transferAndLeaveMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
