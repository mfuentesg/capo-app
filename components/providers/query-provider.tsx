"use client"

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { UserInfo } from "@/features/auth"
import { authKeys } from "@/lib/supabase/constants"

/**
 * React Query provider with SSR-safe configuration.
 * Uses the TanStack v5 recommended singleton pattern:
 * - Server: always creates a new QueryClient
 * - Browser: reuses a single client across renders
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: make a new query client if we don't already have one.
  // This avoids re-making a new client if React suspends during initial render.
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

interface QueryProviderProps {
  children: React.ReactNode
  initialUser?: UserInfo | null
}

export function QueryProvider({ children, initialUser }: QueryProviderProps) {
  const queryClient = getQueryClient()

  if (initialUser) {
    queryClient.setQueryData(authKeys.user(), initialUser)
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
