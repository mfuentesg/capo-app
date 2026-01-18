import type { AppContext } from "@/features/app-context"

export function applyContextFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  context: AppContext
): T {
  return context.type === "personal"
    ? query.eq("user_id", context.userId)
    : query.eq("team_id", context.teamId)
}
