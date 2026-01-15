import type { Session } from "@supabase/supabase-js"

/**
 * Type definitions for auth
 */
export type AuthSession = Session | null

/**
 * User metadata from OAuth providers (e.g., Google)
 */
export interface UserMetadata {
  avatar_url?: string
  picture?: string
  full_name?: string
  name?: string
  email?: string
  [key: string]: unknown
}

/**
 * User information extracted from Supabase session
 */
export interface UserInfo {
  id: string
  email?: string
  avatarUrl?: string
  fullName?: string
  displayName?: string
}
