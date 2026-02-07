import { createApi } from "@/lib/supabase/factory"
import * as dashboardApi from "./dashboardApi"

/**
 * Dashboard API
 *
 * Auto-detects server vs client context and uses appropriate Supabase client.
 * Can be used in both Server Components and Client Components.
 */
export const api = createApi(dashboardApi)

// Re-export types
export type { DashboardStats, RecentSong } from "./dashboardApi"
