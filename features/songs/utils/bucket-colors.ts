import type { SongOwnership } from "@/features/songs/types"
import type { Tables } from "@/lib/supabase/database.types"

/**
 * Returns a CSS color value for the given song ownership.
 * Personal songs get the activity accent (green).
 * Team songs cycle through accent and chart colors by team index.
 */
export function getBucketColor(
  ownership: SongOwnership | undefined,
  teams: Pick<Tables<"teams">, "id">[]
): string {
  if (!ownership) return "var(--border)"
  if (ownership.type === "personal") return "var(--accent-activity)"

  const teamIndex = teams.findIndex((t) => t.id === ownership.teamId)
  const colors = [
    "var(--accent-songs)",
    "var(--accent-playlists)",
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)"
  ]
  return colors[Math.max(0, teamIndex) % colors.length]
}
