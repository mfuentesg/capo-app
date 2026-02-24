import { QueryClient } from "@tanstack/react-query"
import { cache } from "react"

export function makeQueryClient() {
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

/**
 * Returns the same QueryClient instance for the entire React render tree
 * (i.e., per server request via React cache()).
 * Import this in both server components (for prefetch) and QueryProvider
 * so they share the same client, preventing hydration mismatches.
 */
export const getQueryClient = cache(makeQueryClient)
