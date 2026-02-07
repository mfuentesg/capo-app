/**
 * Dashboard API - Supabase REST API functions
 *
 * Pure functions for fetching dashboard stats and data.
 * No React hooks, no side effects beyond Supabase calls.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import type { AppContext } from "@/features/app-context"
import { applyContextFilter } from "@/lib/supabase/apply-context-filter"

export interface DashboardStats {
  totalSongs: number
  totalPlaylists: number
  songsThisMonth: number
  upcomingPlaylists: number
}

export interface RecentSong {
  id: string
  title: string
  artist: string
  key: string
  bpm: number
  addedAt: string
}

/**
 * Get dashboard statistics for the current context
 */
export async function getDashboardStats(
  supabase: SupabaseClient<Database>,
  context: AppContext
): Promise<DashboardStats> {
  // Get first day of current month
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split("T")[0]

  // Build queries with context filter
  let songsQuery = supabase.from("songs").select("id", { count: "exact", head: true })
  songsQuery = applyContextFilter(songsQuery, context)

  let playlistsQuery = supabase.from("playlists").select("id", { count: "exact", head: true })
  playlistsQuery = applyContextFilter(playlistsQuery, context)

  let songsThisMonthQuery = supabase
    .from("songs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", firstOfMonth)
  songsThisMonthQuery = applyContextFilter(songsThisMonthQuery, context)

  let upcomingQuery = supabase
    .from("playlists")
    .select("id", { count: "exact", head: true })
    .gte("date", today)
  upcomingQuery = applyContextFilter(upcomingQuery, context)

  // Execute all queries in parallel
  const [songsResult, playlistsResult, songsThisMonthResult, upcomingResult] = await Promise.all([
    songsQuery,
    playlistsQuery,
    songsThisMonthQuery,
    upcomingQuery
  ])

  return {
    totalSongs: songsResult.count ?? 0,
    totalPlaylists: playlistsResult.count ?? 0,
    songsThisMonth: songsThisMonthResult.count ?? 0,
    upcomingPlaylists: upcomingResult.count ?? 0
  }
}

/**
 * Get recently added songs for the dashboard
 */
export async function getRecentSongs(
  supabase: SupabaseClient<Database>,
  context: AppContext,
  limit: number = 5
): Promise<RecentSong[]> {
  let query = supabase.from("songs").select("id, title, artist, key, bpm, created_at")

  query = applyContextFilter(query, context)

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)

  if (error) throw error

  return (data || []).map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.artist || "",
    key: song.key || "",
    bpm: song.bpm || 0,
    addedAt: formatRelativeTime(song.created_at)
  }))
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMinutes === 0) return "just now"
      return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
    }
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  }

  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return "1 month ago"

  return `${Math.floor(diffDays / 30)} months ago`
}
