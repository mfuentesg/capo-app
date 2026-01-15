"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import type { UserInfo } from "@/features/auth/types"
import { authKeys } from "@/lib/supabase/constants"

/**
 * React Query provider with SSR-safe configuration
 * Uses useState to prevent sharing client between requests
 */
interface QueryProviderProps {
  children: React.ReactNode
  initialUser?: UserInfo | null
}

export function QueryProvider({ children, initialUser }: QueryProviderProps) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })

      if (initialUser) {
        client.setQueryData(authKeys.user(), initialUser)
      }

      return client
    }
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

