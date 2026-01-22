import { createApi } from "@/lib/supabase/factory"
import * as songsApi from "./songsApi"

/**
 * Songs API
 *
 * Auto-detects server vs client context and uses appropriate Supabase client.
 * Can be used in both Server Components and Client Components.
 */
export const api = createApi(songsApi)

// Re-export all functions
export * from "./songsApi"
