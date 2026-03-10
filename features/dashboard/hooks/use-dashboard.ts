"use client"

import { useQuery } from "@tanstack/react-query"
import { useUser } from "@/features/auth"
import { useAppContext } from "@/features/app-context"
import { api } from "@/features/dashboard/api"
import type { DashboardStats, RecentSong } from "@/features/dashboard/api"
import { dashboardKeys } from "./query-keys"

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(initialData?: DashboardStats) {
  const { context } = useAppContext()
  const { data: user } = useUser()

  return useQuery({
    queryKey: context ? dashboardKeys.stats(context) : dashboardKeys.all,
    queryFn: async () => {
      if (!context) {
        return {
          totalSongs: 0,
          totalPlaylists: 0,
          songsThisMonth: 0,
          upcomingPlaylists: 0
        }
      }
      return api.getDashboardStats(context)
    },
    enabled: !!context && !!user?.id,
    initialData
  })
}

/**
 * Hook to fetch recently added songs for dashboard
 */
export function useRecentSongs(limit: number = 5, initialData?: RecentSong[]) {
  const { context } = useAppContext()
  const { data: user } = useUser()

  return useQuery({
    queryKey: context ? dashboardKeys.recentSongs(context, limit) : dashboardKeys.all,
    queryFn: async () => {
      if (!context) {
        return []
      }
      return api.getRecentSongs(context, limit)
    },
    enabled: !!context && !!user?.id,
    initialData
  })
}
