"use client"

import { useQuery } from "@tanstack/react-query"
import { activityKeys } from "./query-keys"
import { api } from "../api"
import { useAppContext } from "@/features/app-context"
import type { Activity } from "../api/activityApi"

/**
 * Hook to fetch activities for the current context (personal or team)
 * Uses AppContext to determine the correct filtering
 */
export function useActivities(limit = 10, filters?: { entityType?: string; entityId?: string }) {
  const { context } = useAppContext()

  return useQuery<Activity[], Error, Activity[], readonly unknown[]>({
    queryKey: context
      ? [...activityKeys.list(context), limit, filters?.entityType, filters?.entityId]
      : [...activityKeys.lists(), limit, filters?.entityType, filters?.entityId],
    queryFn: async () => {
      if (!context) {
        return []
      }

      return (await api.getActivities(context, limit, filters)) as Activity[]
    },
    enabled: !!context
  })
}
