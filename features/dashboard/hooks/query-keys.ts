import type { AppContext } from "@/features/app-context"

/**
 * Query keys for dashboard queries
 * Following the pattern from songs feature
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (context: AppContext) => [...dashboardKeys.all, "stats", context] as const,
  recentSongs: (context: AppContext, limit: number) =>
    [...dashboardKeys.all, "recentSongs", context, limit] as const
}
