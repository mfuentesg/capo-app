import { createApi } from "@/lib/supabase/factory"
import * as songsApi from "./songsApi"

/**
 * Songs API
 *
 * Auto-detects server vs client context and uses appropriate Supabase client.
 * Can be used in both Server Components and Client Components.
 */
export { songsApi as rawApi }
export const api = createApi(songsApi)

// Re-export all functions
export * from "./songsApi"

// Re-export user preferences utilities (raw functions — pass a Supabase client)
export { getUserProfileData, getUserPreferences, upsertUserPreferences } from "./user-preferences-api"
export type { UserProfileData } from "./user-preferences-api"
