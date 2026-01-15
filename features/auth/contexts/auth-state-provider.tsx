"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { authKeys } from "@/lib/supabase/constants"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

/**
 * Provider that listens to Supabase auth state changes
 * and updates React Query cache accordingly
 */
export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null): Promise<void> => {
        switch (event) {
          case "TOKEN_REFRESHED":
          case "SIGNED_IN":
            // Update React Query cache with new session
            queryClient.setQueryData(authKeys.session(), session)
            break

          case "SIGNED_OUT":
            // Clear all auth-related queries
            queryClient.removeQueries({ queryKey: authKeys.all })
            break

          case "USER_UPDATED":
            // Update user data in cache
            if (session) {
              queryClient.setQueryData(authKeys.session(), session)
            }
            break

          default:
            // For other events, just update the session
            queryClient.setQueryData(authKeys.session(), session)
        }
      }
    )

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [queryClient, router])

  return <>{children}</>
}
