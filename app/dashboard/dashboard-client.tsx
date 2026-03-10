"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Music, ListMusic, Plus, Calendar, TrendingUp, Clock, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import KeyBadge from "@/components/key-badge"
import { useTranslation } from "@/hooks/use-translation"
import { useActivityRealtime } from "@/features/activity"
import type { DashboardStats, RecentSong } from "@/features/dashboard"
import { useDashboardStats, useRecentSongs } from "@/features/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { getBpmColorClasses } from "@/lib/badge-colors"
import { cn } from "@/lib/utils"

const ActivityFeedLazy = dynamic(
  () => import("@/features/activity").then((mod) => mod.ActivityFeed),
  {
    ssr: false,
    loading: () => (
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
)

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

function RecentSongSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl p-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

interface DashboardClientProps {
  initialStats?: DashboardStats
  initialRecentSongs?: RecentSong[]
}

export default function DashboardClient({
  initialStats,
  initialRecentSongs = []
}: DashboardClientProps) {
  const [shouldEnableRealtime, setShouldEnableRealtime] = useState(false)
  const { t } = useTranslation()
  const { data: stats = initialStats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentSongs = initialRecentSongs, isLoading: songsLoading } = useRecentSongs(3)

  // Enable real-time activity updates after initial paint to keep hydration light
  useEffect(() => {
    const id = window.setTimeout(() => {
      setShouldEnableRealtime(true)
    }, 1500)
    return () => window.clearTimeout(id)
  }, [])

  if (shouldEnableRealtime) {
    useActivityRealtime()
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient orbs — subtle, same language as landing page */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.2 280 / 10%) 0%, transparent 70%)"
          }}
        />
        <div
          className="absolute top-1/2 -left-48 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.21 40 / 10%) 0%, transparent 70%)"
          }}
        />
        <div
          className="absolute -bottom-32 right-1/3 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.58 0.18 220 / 8%) 0%, transparent 70%)"
          }}
        />
      </div>
      <main className="px-4 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.dashboard.title}</h1>
              <p className="text-muted-foreground">{t.dashboard.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                asChild
                className="transition-shadow hover:shadow-md bg-transparent"
              >
                <Link href="/dashboard/playlists">
                  <ListMusic className="mr-2 h-4 w-4" />
                  {t.dashboard.newPlaylist}
                </Link>
              </Button>
              <Button asChild className="transition-shadow hover:shadow-md">
                <Link href="/dashboard/songs">
                  <Plus className="mr-2 h-4 w-4" />
                  {t.dashboard.addSong}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/songs"
                  className="block rounded-lg border bg-card p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: "color-mix(in oklch, var(--accent-songs) 20%, transparent)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "color-mix(in oklch, var(--accent-songs) 10%, transparent)" }}
                    >
                      <Music className="h-6 w-6" style={{ color: "var(--accent-songs)" }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalSongs ?? 0}</p>
                      <p className="text-sm text-muted-foreground">{t.dashboard.totalSongs}</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/playlists"
                  className="block rounded-lg border bg-card p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: "color-mix(in oklch, var(--accent-playlists) 20%, transparent)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "color-mix(in oklch, var(--accent-playlists) 10%, transparent)" }}
                    >
                      <ListMusic className="h-6 w-6" style={{ color: "var(--accent-playlists)" }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalPlaylists ?? 0}</p>
                      <p className="text-sm text-muted-foreground">{t.dashboard.playlists}</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/songs"
                  className="block rounded-lg border bg-card p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: "color-mix(in oklch, var(--accent-activity) 20%, transparent)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "color-mix(in oklch, var(--accent-activity) 10%, transparent)" }}
                    >
                      <TrendingUp className="h-6 w-6" style={{ color: "var(--accent-activity)" }} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${(stats?.songsThisMonth ?? 0) === 0 ? "text-muted-foreground" : ""}`}>
                        {(stats?.songsThisMonth ?? 0) > 0 ? `+${stats!.songsThisMonth}` : "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">{t.dashboard.thisMonth}</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/playlists"
                  className="block rounded-lg border border-primary/20 bg-card p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.upcomingPlaylists ?? 0}</p>
                      <p className="text-sm text-muted-foreground">{t.dashboard.upcoming}</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: "color-mix(in oklch, var(--accent-songs) 10%, transparent)" }}
                    >
                      <Music className="h-3.5 w-3.5" style={{ color: "var(--accent-songs)" }} />
                    </div>
                    <h3 className="text-lg font-semibold">{t.dashboard.recentlyAdded}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.dashboard.latestSongs}</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="hover:bg-accent">
                  <Link href="/dashboard/songs">
                    {t.dashboard.viewAll}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3 p-4">
                {songsLoading ? (
                  <>
                    <RecentSongSkeleton />
                    <RecentSongSkeleton />
                    <RecentSongSkeleton />
                  </>
                ) : recentSongs && recentSongs.length > 0 ? (
                  recentSongs.map((song) => (
                    <Link
                      key={song.id}
                      href={`/dashboard/songs/${song.id}`}
                      className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted/50 hover:shadow-sm cursor-pointer"
                    >
                      <KeyBadge keyValue={song.key} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className={cn("rounded-full", getBpmColorClasses(song.bpm))}>
                          {song.bpm} BPM
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {song.addedAt}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>{t.dashboard.noSongsYet}</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/dashboard/songs">{t.dashboard.addYourFirstSong}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{t.dashboard.recentActivity}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.recentActivityDescription}
                </p>
              </div>
              <ActivityFeedLazy />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
