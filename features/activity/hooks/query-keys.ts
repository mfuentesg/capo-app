/**
 * Query key factory for activity
 * 
 * Provides consistent query key patterns for React Query cache management
 */

import type { AppContext } from "@/features/app-context"

/**
 * Query key factory for activity
 */
export const activityKeys = {
  all: ["activity"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (context: AppContext) => [...activityKeys.lists(), context] as const,
} as const

