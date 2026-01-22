import { createApi } from "@/lib/supabase/factory"
import * as activityApi from "./activityApi"

/**
 * Activity API
 *
 * Auto-detects server vs client context and uses appropriate Supabase client.
 * Can be used in both Server Components and Client Components.
 */
export const api = createApi(activityApi)

// Re-export types
export type { Activity, ActivityLog } from "./activityApi"
