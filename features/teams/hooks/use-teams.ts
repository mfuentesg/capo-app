"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api as teamsApi } from "../api"
import {
  updateTeamAction,
  deleteTeamAction,
  leaveTeamAction,
  transferTeamOwnershipAction
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
  const { context, switchToPersonal, refreshTeams } = useAppContext()

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
      await refreshTeams()
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
  const { t } = useLocale()
  const { context, switchToPersonal, refreshTeams } = useAppContext()

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
      await refreshTeams()
      toast.success(t.toasts?.teamLeft || "You have left the team")
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
 * Hook to transfer ownership and leave team in one operation (for owners)
 */
export function useTransferAndLeave() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()
  const { context, switchToPersonal, refreshTeams } = useAppContext()

  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      // First transfer ownership, then leave
      await transferTeamOwnershipAction(teamId, newOwnerId)
      await leaveTeamAction(teamId)
    },
    onSuccess: async (_, { teamId }) => {
      // If the left team was active, switch to personal
      if (context?.type === "team" && context.teamId === teamId) {
        switchToPersonal()
      }
      queryClient.invalidateQueries({ queryKey: teamsKeys.list() })
      queryClient.removeQueries({ queryKey: teamsKeys.detail(teamId) })
      await refreshTeams()
      toast.success(t.toasts?.teamLeft || "You have left the team")
      router.push("/dashboard/teams")
    },
    onError: (error) => {
      console.error("Error transferring and leaving team:", error)
      toast.error(t.toasts?.teamLeftFailed || "Failed to leave team")
    }
  })
}
