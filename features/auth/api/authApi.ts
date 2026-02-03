import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import type { UserInfo } from "@/features/auth/types"

export async function getUser(supabase: SupabaseClient<Database>): Promise<UserInfo | null> {
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      // If it's an auth session missing error, return null instead of throwing
      if (error.message?.includes("session") || error.message?.includes("Auth")) {
        return null
      }
      throw error
    }

    if (!user) {
      return null
    }

    return {
      id: user?.id || "",
      email: user?.email,
      avatarUrl: (user?.user_metadata?.avatar_url as string | undefined) || undefined,
      fullName: (user?.user_metadata?.full_name as string | undefined) || undefined,
      displayName: (user?.user_metadata?.name as string | undefined) || undefined
    }
  } catch (error) {
    // Handle any auth-related errors gracefully
    console.debug("Auth error in getUser:", error)
    return null
  }
}

export async function getSession(supabase: SupabaseClient<Database>) {
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error) {
      // If it's an auth session missing error, return null instead of throwing
      if (error.message?.includes("session") || error.message?.includes("Auth")) {
        return null
      }
      throw error
    }

    return session
  } catch (error) {
    // Handle any auth-related errors gracefully
    console.debug("Auth error in getSession:", error)
    return null
  }
}
