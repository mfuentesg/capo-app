"use client"

import { useQuery } from "@tanstack/react-query"
import { getTeams } from "@/features/teams/api/teamsApi"
import { teamsKeys } from "@/features/teams/hooks/query-keys"
import { useUser } from "@/features/auth"

/**
 * Hook to fetch teams the current user belongs to
 */
export function useTeams() {
  const { data: user } = useUser()

  return useQuery({
    queryKey: teamsKeys.list(),
    queryFn: getTeams,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}
