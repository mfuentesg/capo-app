"use client"

import { useQuery } from "@tanstack/react-query"
import { api as teamsApi } from "@/features/teams/api"
import { teamsKeys } from "@/features/teams/hooks/query-keys"
import { useUser } from "@/features/auth"
import type { Tables } from "@/lib/supabase/database.types"

/**
 * Hook to fetch teams the current user belongs to
 */
export function useTeams() {
  const { data: user } = useUser()

  return useQuery<Tables<"teams">[], Error, Tables<"teams">[], readonly ["teams", "list"]>({
    queryKey: teamsKeys.list(),
    queryFn: async () => await teamsApi.getTeams(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}
