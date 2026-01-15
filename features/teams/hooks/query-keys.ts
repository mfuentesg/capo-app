/**
 * Query key factory for teams
 * 
 * Provides consistent query key patterns for React Query cache management
 */

/**
 * Query key factory for teams
 */
export const teamsKeys = {
  all: ["teams"] as const,
  lists: () => [...teamsKeys.all, "list"] as const,
  list: () => [...teamsKeys.lists()] as const,
  details: () => [...teamsKeys.all, "detail"] as const,
  detail: (id: string) => [...teamsKeys.details(), id] as const,
  members: (teamId: string) => [...teamsKeys.detail(teamId), "members"] as const,
  invitations: (teamId: string) => [...teamsKeys.detail(teamId), "invitations"] as const,
} as const

