"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api as teamsApi } from "../api"
import {
  updateTeamAction,
  deleteTeamAction,
  leaveTeamAction,
  transferTeamOwnershipAction,
  inviteTeamMemberAction,
  removeTeamMemberAction,
  changeTeamMemberRoleAction,
  deleteTeamInvitationAction
} from "../api/actions"
import { teamsKeys } from "./query-keys"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { useLocale } from "@/features/settings"
import { toast } from "sonner"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"

/**
 * Hook to fetch teams the current user belongs to
 */
export function useTeams() {
  const { data: user } = useUser()

  return useQuery<Tables<"teams">[], Error, Tables<"teams">[], readonly ["teams", "list"]>({
    queryKey: teamsKeys.list(),
    queryFn: async () => await teamsApi.getTeams(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Hook to update a team
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ teamId, updates }: { teamId: string; updates: TablesUpdate<"teams"> }) => {
      return updateTeamAction(teamId, updates)
    },
    onMutate: async ({ teamId, updates }) => {
      // Cancel any in-flight queries for the team
      await queryClient.cancelQueries({ queryKey: teamsKeys.detail(teamId) })
      await queryClient.cancelQueries({ queryKey: teamsKeys.list() })

      // Get previous data for rollback
      const previousTeam = queryClient.getQueryData<Tables<"teams">>(teamsKeys.detail(teamId))
      const previousTeams = queryClient.getQueryData<Tables<"teams">[]>(teamsKeys.list())

      // Update detail query with optimistic data
      if (previousTeam) {
        queryClient.setQueryData(teamsKeys.detail(teamId), {
          ...previousTeam,
          ...updates
        })
      }

      // Update list query with optimistic data
      if (previousTeams) {
        queryClient.setQueryData(
          teamsKeys.list(),
          previousTeams.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
        )
      }

      return { previousTeam, previousTeams }
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) })
      toast.success(t.toasts?.teamUpdated || "Team updated")
    },
    onError: (error, { teamId }, context) => {
      // Rollback to previous data
      if (context?.previousTeam) {
        queryClient.setQueryData(teamsKeys.detail(teamId), context.previousTeam)
      }
      if (context?.previousTeams) {
        queryClient.setQueryData(teamsKeys.list(), context.previousTeams)
      }
      console.error("Error updating team:", error)
      toast.error(t.toasts?.teamUpdatedFailed || "Failed to update team")
    }
  })
}

/**
 * Hook to delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()
  const { context, switchToPersonal } = useAppContext()

  return useMutation({
    mutationFn: async (teamId: string) => {
      return deleteTeamAction(teamId)
    },
    onSuccess: async (_, teamId) => {
      // If the deleted team was active, switch to personal
      if (context?.type === "team" && context.teamId === teamId) {
        switchToPersonal()
      }
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      queryClient.removeQueries({ queryKey: teamsKeys.detail(teamId) })
      toast.success(t.toasts?.teamDeleted || "Team deleted")
      router.push("/dashboard/teams")
    },
    onError: (error) => {
      console.error("Error deleting team:", error)
      toast.error(t.toasts?.teamDeletedFailed || "Failed to delete team")
    }
  })
}

/**
 * Hook to leave a team
 */
export function useLeaveTeam() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()
  const { context, switchToPersonal } = useAppContext()

  return useMutation({
    mutationFn: async (teamId: string) => {
      return leaveTeamAction(teamId)
    },
    onSuccess: async (_, teamId) => {
      // If the left team was active, switch to personal
      if (context?.type === "team" && context.teamId === teamId) {
        switchToPersonal()
      }
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      toast.success(t.toasts?.teamLeft || "You have left the team")
      router.push("/dashboard/teams")
    },
    onError: (error) => {
      console.error("Error leaving team:", error)
      toast.error(t.toasts?.teamLeftFailed || "Failed to leave team")
    }
  })
}

/**
 * Hook to transfer team ownership to another member
 */
export function useTransferOwnership() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      return transferTeamOwnershipAction(teamId, newOwnerId)
    },
    onSuccess: async (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) })
      queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
      toast.success(t.toasts?.ownershipTransferred || "Ownership transferred successfully")
    },
    onError: (error) => {
      console.error("Error transferring ownership:", error)
      toast.error(t.toasts?.ownershipTransferFailed || "Failed to transfer ownership")
    }
  })
}

/**
 * Hook to transfer ownership and stay on the team as admin (for owners)
 */
export function useTransferOwnershipAndStay() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      // transfer_team_ownership already demotes the current owner to admin.
      await transferTeamOwnershipAction(teamId, newOwnerId)
    },
    onSuccess: async (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) })
      queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
      toast.success(t.toasts?.ownershipTransferred || "Ownership transferred successfully")
    },
    onError: (error) => {
      console.error("Error transferring ownership:", error)
      toast.error(t.toasts?.ownershipTransferFailed || "Failed to transfer ownership")
    }
  })
}

/**
 * Hook to transfer ownership and leave the team (for owners)
 */
export function useTransferAndLeave() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()
  const { context, switchToPersonal } = useAppContext()

  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      await transferTeamOwnershipAction(teamId, newOwnerId)
      await leaveTeamAction(teamId)
    },
    onSuccess: async (_, { teamId }) => {
      if (context?.type === "team" && context.teamId === teamId) {
        switchToPersonal()
      }
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      queryClient.removeQueries({ queryKey: teamsKeys.detail(teamId) })
      toast.success(t.toasts?.teamLeft || "You have left the team")
      router.push("/dashboard/teams")
    },
    onError: (error) => {
      console.error("Error transferring and leaving team:", error)
      toast.error(t.toasts?.teamLeftFailed || "Failed to leave team")
    }
  })
}

/**
 * Hook to invite a member to a team
 */
export function useInviteTeamMember() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({
      teamId,
      email,
      role = "member"
    }: {
      teamId: string
      email: string
      role?: Tables<"team_invitations">["role"]
    }) => {
      return inviteTeamMemberAction(teamId, email, role)
    },
    onSuccess: async (_, { teamId }) => {
      // Only invalidate invitations — inviting doesn't change the members list.
      // Invalidating members caused a flash of "No members" because the
      // client-side refetch could return an empty array momentarily.
      queryClient.invalidateQueries({ queryKey: teamsKeys.invitations(teamId) })
      toast.success(t.toasts?.invitationSent || "Invitation sent successfully")
    },
    onError: (error) => {
      console.error("Error inviting team member:", error)
      const message = error instanceof Error ? error.message : "Failed to send invitation"
      toast.error(message)
    }
  })
}

/**
 * Hook to remove a member from a team
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      return removeTeamMemberAction(teamId, userId)
    },
    onSuccess: async (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
      toast.success(t.toasts?.memberRemoved || "Member removed successfully")
    },
    onError: (error) => {
      console.error("Error removing team member:", error)
      const message = error instanceof Error ? error.message : "Failed to remove member"
      toast.error(message)
    }
  })
}

/**
 * Hook to change a team member's role
 */
export function useChangeTeamMemberRole() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
      newRole
    }: {
      teamId: string
      userId: string
      newRole: Tables<"team_members">["role"]
    }) => {
      return changeTeamMemberRoleAction(teamId, userId, newRole)
    },
    onSuccess: async (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
      toast.success(t.toasts?.roleChanged || "Member role updated")
    },
    onError: (error) => {
      console.error("Error changing member role:", error)
      const message = error instanceof Error ? error.message : "Failed to change role"
      if (message.includes("Cannot demote team owner")) {
        toast.error(t.toasts?.roleChangeOwnerNotAllowed || "Cannot change the team owner")
        return
      }
      if (message.includes("Only owners and admins")) {
        toast.error(
          t.toasts?.roleChangePermissionDenied || "You do not have permission to change roles"
        )
        return
      }
      if (message.includes("Admins can only")) {
        toast.error(t.toasts?.roleChangeAdminLimit || "Admins can only assign Member or Viewer")
        return
      }
      toast.error(message)
    }
  })
}

/**
 * Hook to cancel a pending invitation
 */
export function useCancelTeamInvitation() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string; teamId: string }) => {
      return deleteTeamInvitationAction(invitationId)
    },
    onSuccess: async (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.invitations(teamId) })
      toast.success(t.toasts?.invitationCanceled || "Invitation canceled")
    },
    onError: (error) => {
      console.error("Error canceling invitation:", error)
      const message = error instanceof Error ? error.message : "Failed to cancel invitation"
      toast.error(message)
    }
  })
}
