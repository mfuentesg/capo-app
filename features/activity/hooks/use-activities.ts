"use client"

import { useQuery } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import { activityKeys } from "./query-keys"
import { getMockActivities } from "@/lib/mock-data"

/**
 * Hook to fetch activities for the current user
 * Uses personal context (user_id filtering)
 * Currently returns mock data matching database structure
 */
export function useActivities(limit = 10) {
  const { data: user } = useUser()

  return useQuery({
    queryKey: [...activityKeys.list({ type: "personal", userId: user?.id || "" }), limit],
    queryFn: async () => {
      if (!user?.id) {
        return []
      }
      // Return mock data for now
      return getMockActivities().slice(0, limit)
    },
    enabled: !!user?.id
  })
}
