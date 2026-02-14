"use client"

import { useQuery } from "@tanstack/react-query"
import { teamsKeys } from "../hooks/query-keys"
import { api as teamsApi } from "../api"
import { useUser } from "@/features/auth"
import {
  useDeleteTeam,
  useLeaveTeam,
  useUpdateTeam,
  useTransferOwnershipAndStay,
  useTransferAndLeave
} from "../hooks"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { TeamDetailHeader } from "@/features/teams"
import { TeamMembersSection } from "@/features/teams"
import { TeamDangerZone } from "@/features/teams"

interface TeamDetailClientProps {
  initialTeam: Tables<"teams">
  initialMembers: (Tables<"team_members"> & {
    user_full_name: string | null
    user_email: string | null
    user_avatar_url: string | null
  })[]
  initialInvitations: Tables<"team_invitations">[]
}

export function TeamDetailClient({
  initialTeam,
  initialMembers,
  initialInvitations
}: TeamDetailClientProps) {
  const { data: user } = useUser()
  const deleteTeamMutation = useDeleteTeam()
  const leaveTeamMutation = useLeaveTeam()
  const updateTeamMutation = useUpdateTeam()
  const transferOwnershipMutation = useTransferOwnershipAndStay()
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
    (Tables<"team_members"> & {
      user_full_name: string | null
      user_email: string | null
      user_avatar_url: string | null
    })[],
    Error,
    (Tables<"team_members"> & {
      user_full_name: string | null
      user_email: string | null
      user_avatar_url: string | null
    })[],
    readonly unknown[]
  >({
    queryKey: teamsKeys.members(initialTeam.id),
    queryFn: async () => await teamsApi.getTeamMembers(initialTeam.id),
    initialData: initialMembers as (Tables<"team_members"> & {
      user_full_name: string | null
      user_email: string | null
      user_avatar_url: string | null
    })[],
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

  const handleLeave = () => {
    leaveTeamMutation.mutate(team.id)
  }

  const handleTransferOwnership = (newOwnerId: string) => {
    transferOwnershipMutation.mutate({
      teamId: team.id,
      newOwnerId
    })
  }

  const handleTransferAndLeave = (newOwnerId: string) => {
    transferAndLeaveMutation.mutate({ teamId: team.id, newOwnerId })
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <TeamDetailHeader team={team} onUpdate={handleUpdate} isOwner={isOwner} />
        <TeamMembersSection
          members={members || []}
          invitations={invitations || []}
          teamId={team.id}
          currentUserId={user?.id}
          currentUserRole={currentUserRole}
        />
        {user && (
          <TeamDangerZone
            teamName={team.name}
            members={members || []}
            currentUserId={user.id}
            isOwner={isOwner}
            onLeave={handleLeave}
            onDelete={handleDelete}
            onTransferOwnership={handleTransferOwnership}
            onTransferAndLeave={handleTransferAndLeave}
            isDeleting={deleteTeamMutation.isPending}
            isTransferring={
              transferOwnershipMutation.isPending || transferAndLeaveMutation.isPending
            }
            isLeaving={leaveTeamMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
