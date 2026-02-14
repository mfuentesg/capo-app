"use client"

import { useQuery } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import { activityKeys } from "./query-keys"
import { api } from "../api"
import type { AppContext } from "@/features/app-context"
import type { Activity } from "../api/activityApi"

/**
 * Hook to fetch activities for the current user
 * Uses personal context (user_id filtering)
 */
export function useActivities(limit = 10) {
  const { data: user } = useUser()

  return useQuery<Activity[], Error, Activity[], readonly unknown[]>({
    queryKey: [...activityKeys.list({ type: "personal" as const, userId: user?.id || "" }), limit],
    queryFn: async () => {
      if (!user?.id) {
        return []
      }

      const context: AppContext = {
        type: "personal",
        userId: user.id
      }

      return (await api.getActivities(context, limit)) as Activity[]
    },
    enabled: !!user?.id
  })
}
