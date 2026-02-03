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
import type { AuthError } from "@supabase/supabase-js"
import { toast } from "sonner"
import { useLocale } from "@/features/settings"
import type { UserInfo } from "@/features/auth/types"
import type { Session } from "@supabase/supabase-js"
import { api as authApi } from "@/features/auth/api"

export function useSession() {
  return useQuery<Session | null, Error, Session | null, readonly ["auth", "session"]>({
    queryKey: authKeys.session(),
    queryFn: async () => {
      try {
        return authApi.getSession()
      } catch (error) {
        // Handle AuthSessionMissingError gracefully - return null for no session
        console.debug("No active session:", error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false // Don't retry auth errors
  })
}

export function useUser(initialData?: UserInfo | null) {
  return useQuery<UserInfo | null, Error, UserInfo | null, readonly ["auth", "user"]>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        return authApi.getUser()
      } catch (error) {
        // Handle AuthSessionMissingError gracefully - return null for no user
        console.debug("No authenticated user:", error)
        return null
      }
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false // Don't retry auth errors
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
      queryClient.removeQueries({ queryKey: authKeys.all })
      router.push(LOGIN_PATH)
    },
    onError: (error: AuthError) => {
      console.error("Error signing out:", error)
      toast.error(t.toasts.signOutFailed)
    }
  })
}
