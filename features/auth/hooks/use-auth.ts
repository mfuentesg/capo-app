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
import { useLocale } from "@/contexts/locale-context"
import type { UserInfo } from "@/features/auth/types"

async function getUser(): Promise<UserInfo | null> {
  const supabase = createClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    return null
  }

  return {
    id: user?.id || "",
    email: user?.email,
    avatarUrl: user?.user_metadata.avatar_url,
    fullName: user?.user_metadata.full_name,
    displayName: user?.user_metadata.name
  }
}

export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getUser,
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
      queryClient.removeQueries({ queryKey: authKeys.all })
      router.push(LOGIN_PATH)
    },
    onError: (error: AuthError) => {
      console.error("Error signing out:", error)
      toast.error(t.toasts.signOutFailed)
    }
  })
}
