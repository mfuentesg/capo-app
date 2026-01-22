import { createApi } from "@/lib/supabase/factory"
import * as authApi from "./authApi"

/**
 * Auth API
 *
 * Auto-detects server vs client context and uses appropriate Supabase client.
 * Can be used in both Server Components and Client Components.
 */

export const api = createApi(authApi)

// Re-export functions
export { getUser, getSession } from "./authApi"

// Re-export types
export type { UserInfo } from "@/features/auth/types"
