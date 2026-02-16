import type { AppContext } from "@/features/app-context"

type ContextFilterQuery<T> = {
  eq: (column: string, value: string) => T
  is: (column: string, value: boolean | null) => T
}

export function applyContextFilter<T extends ContextFilterQuery<T>>(
  query: T,
  context: AppContext
): T {
  if (context.type === "personal") {
    return query.eq("user_id", context.userId).is("team_id", null)
  }

  return query.eq("team_id", context.teamId).is("user_id", null)
}
