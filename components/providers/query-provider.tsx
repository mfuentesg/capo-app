"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { UserInfo } from "@/features/auth"
import { authKeys } from "@/lib/supabase/constants"
import { makeQueryClient } from "./get-query-client"

/**
 * React Query provider with SSR-safe configuration.
 *
 * Uses useState to stabilize the QueryClient reference across renders:
 * - Server (SSR): makeQueryClient() creates a fresh client per request
 * - Browser: reuses a module-level singleton to avoid re-creating on re-mount
 *
 * HydrationBoundary (in page components) transfers prefetched server data
 * into this client for both the SSR pass and browser hydration.
 */

let browserQueryClient: QueryClient | undefined

function getQueryClientForProvider() {
  if (typeof window === "undefined") {
    // Server: always a fresh client — HydrationBoundary will hydrate it
    return makeQueryClient()
  }
  // Browser: reuse singleton so cache persists across navigation
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

interface QueryProviderProps {
  children: React.ReactNode
  initialUser?: UserInfo | null
}

export function QueryProvider({ children, initialUser }: QueryProviderProps) {
  // useState ensures the same client instance across all renders in this tree
  const [queryClient] = useState<QueryClient>(() => getQueryClientForProvider())

  if (initialUser) {
    queryClient.setQueryData(authKeys.user(), initialUser)
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
