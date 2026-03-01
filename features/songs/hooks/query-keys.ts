/**
 * Query key factory for songs
 *
 * Provides consistent query key patterns for React Query cache management
 */

import type { AppContext } from "@/features/app-context"

/**
 * Query key factory for songs
 */
export const songsKeys = {
  all: ["songs"] as const,
  lists: () => [...songsKeys.all, "list"] as const,
  list: (context: AppContext) => [...songsKeys.lists(), context] as const,
  details: () => [...songsKeys.all, "detail"] as const,
  detail: (id: string) => [...songsKeys.details(), id] as const,
  userSettings: (songId: string) => [...songsKeys.detail(songId), "user-settings"] as const
} as const
