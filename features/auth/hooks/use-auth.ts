"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  authKeys,
  AUTH_CALLBACK_PATH,
  DEFAULT_REDIRECT_PATH,
  LOGIN_PATH
} from "@/lib/supabase/constants"
import type { Session, AuthError } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useLocale } from "@/contexts/locale-context"
import type { AuthSession, UserMetadata, UserInfo } from "@/features/auth/types"

/**
 * Helper function to extract user information from a session
 */
export function getUserInfo(session: Session | null | undefined): UserInfo | null {
  if (!session?.user) {
    return null
  }

  const metadata = (session.user.user_metadata as UserMetadata | undefined) || {}
  const email = session.user.email || metadata.email
  const avatarUrl = metadata.avatar_url || metadata.picture
  const fullName = metadata.full_name || metadata.name
  const displayName = fullName || email || "User"

  return {
    id: session.user.id,
    email,
    avatarUrl,
    fullName,
    displayName
  }
}

/**
 * Fetches the current session from Supabase
 */
async function getSession(): Promise<AuthSession> {
  const supabase = createClient()
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

/**
 * Hook to get the current session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Hook to sign in with Google
 */
export function useSignInWithGoogle() {
  const queryClient = useQueryClient()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const callbackUrl = `${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(DEFAULT_REDIRECT_PATH)}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${callbackUrl}`
        }
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      // Invalidate session query to refetch after redirect
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
    },
    onError: (error: AuthError) => {
      console.error("Error signing in with Google:", error)
      toast.error(t.toasts.signInFailed)
    }
  })
}

/**
 * Hook to sign out
 */
export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useLocale()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all })
      // Redirect to login
      router.push(LOGIN_PATH)
    },
    onError: (error: AuthError) => {
      console.error("Error signing out:", error)
      toast.error(t.toasts.signOutFailed)
    }
  })
}
