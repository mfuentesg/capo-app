"use client"

import Link from "next/link"
import { useActivities } from "@/features/activity/hooks/use-activities"
import { Skeleton } from "@/components/ui/skeleton"
import { Music, ListMusic, Users, Clock } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import type { Activity } from "@/features/activity/api/activityApi"

/**
 * Format a date as relative time using native Intl.RelativeTimeFormat
 * @param date - The date to format
 * @param locale - The locale to use (default: "en")
 * @returns Formatted relative time string (e.g., "2 hours ago", "in 3 days")
 */
function formatRelativeTime(date: Date, locale: string = "en"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" })
  const now = new Date()
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

  // Determine the appropriate unit and value
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 }
  ]

  const absDiff = Math.abs(diffInSeconds)

  for (const { unit, seconds } of units) {
    const value = Math.floor(absDiff / seconds)
    if (value >= 1 || unit === "second") {
      return rtf.format(diffInSeconds < 0 ? -value : value, unit)
    }
  }

  return rtf.format(0, "second")
}

function getActivityIcon(action: string) {
  if (action.includes("song")) {
    return <Music className="h-4 w-4" />
  }
  if (action.includes("playlist")) {
    return <ListMusic className="h-4 w-4" />
  }
  if (action.includes("team")) {
    return <Users className="h-4 w-4" />
  }
  return <Music className="h-4 w-4" />
}

function formatActivityMessage(activity: {
  action: string
  metadata: Record<string, unknown> | null
}) {
  const { action, metadata } = activity
  const name = metadata?.name || metadata?.title || "item"
  const nameStr = typeof name === "string" ? name : "item"

  // Handle team_invitation_accepted with team and user info
  if (action === "team_invitation_accepted" && metadata) {
    const teamName = metadata.team_name as string | undefined
    const userName = metadata.user_name as string | undefined
    if (teamName && userName) {
      return `${userName} joined team "${teamName}"`
    }
    return "Accepted team invitation"
  }

  const actionMap: Record<string, string> = {
    song_created: `Created song "${nameStr}"`,
    song_updated: `Updated song "${nameStr}"`,
    song_deleted: `Deleted song "${nameStr}"`,
    playlist_created: `Created playlist "${nameStr}"`,
    playlist_updated: `Updated playlist "${nameStr}"`,
    playlist_deleted: `Deleted playlist "${nameStr}"`,
    team_created: `Created team "${nameStr}"`,
    team_updated: `Updated team "${nameStr}"`,
    team_deleted: `Deleted team "${nameStr}"`,
    team_member_role_changed: "Changed team member role",
    team_ownership_transferred: "Transferred team ownership"
  }

  return actionMap[action] || action.replace(/_/g, " ")
}

function getActivityLink(activity: Activity): string | null {
  if (activity.entityType === "song" && !activity.action.includes("deleted")) {
    return `/dashboard/songs/${activity.entityId}`
  }

  if (activity.entityType === "playlist" && !activity.action.includes("deleted")) {
    return `/dashboard/playlists`
  }

  return null
}

export function ActivityFeed() {
  const { data: activities, isLoading } = useActivities(5)
  const { locale, t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Music className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-sm text-muted-foreground">{t.activity.noActivity}</p>
        <p className="text-xs text-muted-foreground mt-1">{t.activity.noActivityDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {activities.map((activity) => {
        const link = getActivityLink(activity)
        const content = (
          <>
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {getActivityIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{formatActivityMessage(activity)}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(activity.createdAt), locale)}
                </span>
              </div>
            </div>
          </>
        )

        if (link) {
          return (
            <Link
              key={activity.id}
              href={link}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer"
            >
              {content}
            </Link>
          )
        }

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
