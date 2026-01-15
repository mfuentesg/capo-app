/**
 * Auth-related constants
 */

export const AUTH_CALLBACK_PATH = "/auth/callback"
export const DEFAULT_REDIRECT_PATH = "/dashboard"
export const LOGIN_PATH = "/"

/**
 * Query keys factory for auth-related queries
 */
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  user: () => [...authKeys.all, "user"] as const
} as const

