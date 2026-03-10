"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api as teamsApi } from "../api"
import { TeamWithMemberCount } from "../api/teamsApi"
import {
  acceptTeamInvitationAction,
  updateTeamAction,
  deleteTeamAction,
  leaveTeamAction,
  transferTeamOwnershipAction,
  inviteTeamMemberAction,
  removeTeamMemberAction,
  changeTeamMemberRoleAction,
  deleteTeamInvitationAction,
  getPendingInvitationsAction
} from "../api/actions"
import { teamsKeys } from "./query-keys"
import { useUser } from "@/features/auth"
import { useLocale } from "@/features/settings"
import { toast } from "sonner"
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import type { PendingInvitation } from "../types"

/**
 * Hook to fetch teams the current user belongs to
 */
export function useTeams(initialData?: TeamWithMemberCount[]) {
  const { data: user } = useUser()

  return useQuery<TeamWithMemberCount[], Error, TeamWithMemberCount[], readonly ["teams", "list"]>({
    queryKey: teamsKeys.list(),
    queryFn: async () => await teamsApi.getTeams(),
    enabled: !!user?.id || !!initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    initialData
  })
}

/**
 * Hook to fetch pending invitations for the current user
 */
export function usePendingInvitations(initialData?: PendingInvitation[]) {
  const { data: user } = useUser()

  return useQuery<PendingInvitation[]>({
    queryKey: teamsKeys.pendingInvitations(),
    queryFn: () => getPendingInvitationsAction(),
    enabled: !!user?.id || !!initialData,
    staleTime: 30 * 1000,
    initialData
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
      // Cancel any in-flight queries for the team (exact: true to avoid cancelling members/invitations)
      await queryClient.cancelQueries({ queryKey: teamsKeys.detail(teamId), exact: true })
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
    onSuccess: () => {
      toast.success(t.toasts?.teamUpdated || "Team updated")
    },
    onError: (error, { teamId }, context) => {
      // Rollback to previous data (exact key — setQueryData is always exact)
      if (context?.previousTeam !== undefined) {
        queryClient.setQueryData(teamsKeys.detail(teamId), context.previousTeam)
      }
      if (context?.previousTeams !== undefined) {
        queryClient.setQueryData(teamsKeys.list(), context.previousTeams)
      }
      console.error("Error updating team:", error)
      toast.error(t.toasts?.teamUpdatedFailed || "Failed to update team")
    },
    onSettled: (_, __, { teamId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId), exact: true })
      ])
    }
  })
}

/**
 * Hook to delete a team
 */
export function useDeleteTeam(options?: { onSuccess?: (teamId: string) => void }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async (teamId: string) => {
      return deleteTeamAction(teamId)
    },
    onSuccess: async (_, teamId) => {
      options?.onSuccess?.(teamId)
      toast.success(t.toasts?.teamDeleted || "Team deleted")
      router.push("/dashboard/teams")
    },
    onSettled: (_, __, teamId) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.list() }),
        queryClient.removeQueries({ queryKey: teamsKeys.detail(teamId) })
      ])
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
export function useLeaveTeam(options?: { onSuccess?: (teamId: string) => void }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async (teamId: string) => {
      return leaveTeamAction(teamId)
    },
    onSuccess: async (_, teamId) => {
      options?.onSuccess?.(teamId)
      toast.success(t.toasts?.teamLeft || "You have left the team")
      router.push("/dashboard/teams")
    },
    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
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
    onSuccess: async () => {
      toast.success(t.toasts?.ownershipTransferred || "Ownership transferred successfully")
    },
    onSettled: (_, __, { teamId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
      ])
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
    onSuccess: async () => {
      toast.success(t.toasts?.ownershipTransferred || "Ownership transferred successfully")
    },
    onSettled: (_, __, { teamId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.detail(teamId) }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
      ])
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
export function useTransferAndLeave(options?: { onSuccess?: (teamId: string) => void }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      await transferTeamOwnershipAction(teamId, newOwnerId)
      await leaveTeamAction(teamId)
    },
    onSuccess: async (_, { teamId }) => {
      options?.onSuccess?.(teamId)
      toast.success(t.toasts?.teamLeft || "You have left the team")
      router.push("/dashboard/teams")
    },
    onSettled: (_, __, { teamId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.list() }),
        queryClient.removeQueries({ queryKey: teamsKeys.detail(teamId) })
      ])
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
  const { data: user } = useUser()

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
    onMutate: async ({ teamId, email, role = "member" }) => {
      await queryClient.cancelQueries({ queryKey: teamsKeys.invitations(teamId) })

      const previousInvitations = queryClient.getQueryData<Tables<"team_invitations">[]>(
        teamsKeys.invitations(teamId)
      )

      const optimisticInvitation: Tables<"team_invitations"> = {
        id: `temp-${Date.now()}`,
        email,
        role,
        team_id: teamId,
        invited_by: user?.id || "",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: null,
        token: `temp-token-${Date.now()}`
      }

      queryClient.setQueryData<Tables<"team_invitations">[]>(
        teamsKeys.invitations(teamId),
        (old) => {
          if (!old) return [optimisticInvitation]
          return [...old, optimisticInvitation]
        }
      )

      return { previousInvitations }
    },
    onSuccess: async () => {
      toast.success(t.toasts?.invitationSent || "Invitation sent successfully")
    },
    onSettled: (_, __, { teamId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.invitations(teamId) }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      ])
    },
    onError: (error, { teamId }, context) => {
      if (context?.previousInvitations !== undefined) {
        queryClient.setQueryData(teamsKeys.invitations(teamId), context.previousInvitations)
      }
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

  type MemberWithUser = Tables<"team_members"> & {
    user_full_name: string | null
    user_email: string | null
    user_avatar_url: string | null
  }

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      return removeTeamMemberAction(teamId, userId)
    },
    onMutate: async ({ teamId, userId }) => {
      await queryClient.cancelQueries({ queryKey: teamsKeys.members(teamId) })

      const previousMembers = queryClient.getQueryData<MemberWithUser[]>(
        teamsKeys.members(teamId)
      )

      queryClient.setQueryData<MemberWithUser[]>(
        teamsKeys.members(teamId),
        (old) => {
          if (!old) return []
          return old.filter((m) => m.user_id !== userId)
        }
      )

      return { previousMembers }
    },
    onSuccess: async () => {
      toast.success(t.toasts?.memberRemoved || "Member removed successfully")
    },
    onSettled: (_, __, { teamId }) => {
      return queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
    },
    onError: (error, { teamId }, context) => {
      if (context?.previousMembers !== undefined) {
        queryClient.setQueryData(teamsKeys.members(teamId), context.previousMembers)
      }
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
    onSuccess: async () => {
      toast.success(t.toasts?.roleChanged || "Member role updated")
    },
    onSettled: (_, __, { teamId }) => {
      return queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) })
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
    onMutate: async ({ invitationId, teamId }) => {
      await queryClient.cancelQueries({ queryKey: teamsKeys.invitations(teamId) })

      const previousInvitations = queryClient.getQueryData<Tables<"team_invitations">[]>(
        teamsKeys.invitations(teamId)
      )

      queryClient.setQueryData<Tables<"team_invitations">[]>(
        teamsKeys.invitations(teamId),
        (old) => {
          if (!old) return []
          return old.filter((inv) => inv.id !== invitationId)
        }
      )

      return { previousInvitations }
    },
    onSuccess: async () => {
      toast.success(t.toasts?.invitationCanceled || "Invitation canceled")
    },
    onSettled: (_, __, { teamId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.invitations(teamId) }),
        // Also invalidate pending invitations for the current user just in case
        queryClient.invalidateQueries({ queryKey: teamsKeys.pendingInvitations() })
      ])
    },
    onError: (error, { teamId }, context) => {
      if (context?.previousInvitations !== undefined) {
        queryClient.setQueryData(teamsKeys.invitations(teamId), context.previousInvitations)
      }
      console.error("Error canceling invitation:", error)
      const message = error instanceof Error ? error.message : "Failed to cancel invitation"
      toast.error(message)
    }
  })
}

/**
 * Hook to resend (delete + re-create) an expired team invitation
 */
export function useResendTeamInvitation() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async ({
      invitationId,
      teamId,
      email,
      role
    }: {
      invitationId: string
      teamId: string
      email: string
      role: Tables<"team_invitations">["role"]
    }) => {
      await deleteTeamInvitationAction(invitationId)
      return inviteTeamMemberAction(teamId, email, role)
    },
    onSuccess: async () => {
      toast.success(t.toasts?.invitationResent || "Invitation resent successfully")
    },
    onSettled: (_, __, { teamId }) => {
      return queryClient.invalidateQueries({ queryKey: teamsKeys.invitations(teamId) })
    },
    onError: (error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.invitations(teamId) })
      console.error("Error resending invitation:", error)
      const message = error instanceof Error ? error.message : "Failed to resend invitation"
      toast.error(message)
    }
  })
}

/**
 * Hook to accept a team invitation by token
 */
export function useAcceptTeamInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const result = await acceptTeamInvitationAction(token)
      if (result.errorMessage) {
        throw new Error(result.errorMessage)
      }
      if (!result.teamId) {
        throw new Error("Failed to accept invitation")
      }
      return result.teamId
    },
    onSuccess: () => {
      // Invalidate everything to be safe as user is now part of a new team
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: teamsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: teamsKeys.pendingInvitations() })
      ])
    },
    onSettled: () => {
      // We don't have teamId here easily from the parameters, but onSuccess should have covered it
    }
  })
}
