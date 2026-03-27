"use client"

import { } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ListMusic, Plus, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import KeyBadge from "@/components/key-badge"
import { useActivityRealtime } from "@/features/activity"
import type { DashboardStats, RecentSong } from "@/features/dashboard"
import { useDashboardStats, useRecentSongs } from "@/features/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { getBpmColorClasses } from "@/lib/badge-colors"
import { cn } from "@/lib/utils"
import type { getTranslations } from "@/lib/i18n/translations"

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

function StatStripSkeleton() {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 space-y-2">
            <Skeleton className="h-4 w-8 rounded-full mb-3" />
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
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
  t: ReturnType<typeof getTranslations>
}

export default function DashboardClient({
  initialStats,
  initialRecentSongs = [],
  t
}: DashboardClientProps) {
  const { data: stats = initialStats, isLoading: statsLoading } = useDashboardStats(initialStats)
  const { data: recentSongs = initialRecentSongs, isLoading: songsLoading } = useRecentSongs(
    3,
    initialRecentSongs
  )

  // Fix: useActivityRealtime must be at top level
  // The hook already handles context/user availability internally
  useActivityRealtime()

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient orbs — subtle, same language as landing page */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.749 0.160 298 / 10%) 0%, transparent 70%)"
          }}
        />
        <div
          className="absolute top-1/2 -left-48 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.793 0.132 56 / 10%) 0%, transparent 70%)"
          }}
        />
        <div
          className="absolute -bottom-32 right-1/3 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.778 0.120 224 / 8%) 0%, transparent 70%)"
          }}
        />
      </div>

      <main className="px-4 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-0.5">
              <h1 className="text-3xl font-black tracking-tighter leading-none sm:text-4xl">
                {t.dashboard.title}
              </h1>
              <p className="text-muted-foreground pt-1">{t.dashboard.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                asChild
                className="transition active:scale-[0.98] bg-transparent"
              >
                <Link href="/dashboard/playlists">
                  <ListMusic className="mr-2 h-4 w-4" />
                  {t.dashboard.newPlaylist}
                </Link>
              </Button>
              <Button asChild className="transition active:scale-[0.98]">
                <Link href="/dashboard/songs">
                  <Plus className="mr-2 h-4 w-4" />
                  {t.dashboard.addSong}
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats strip — scorecard style, single container with accent bars */}
          {statsLoading ? (
            <StatStripSkeleton />
          ) : (
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4">
                <Link
                  href="/dashboard/songs"
                  className="p-6 transition-colors hover:bg-muted/40 border-b border-r sm:border-b-0"
                >
                  <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: "var(--accent-songs)" }} />
                  <p className="text-3xl font-black tabular-nums">{stats?.totalSongs ?? 0}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {t.dashboard.totalSongs}
                  </p>
                </Link>
                <Link
                  href="/dashboard/playlists"
                  className="p-6 transition-colors hover:bg-muted/40 border-b sm:border-b-0 sm:border-r"
                >
                  <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: "var(--accent-playlists)" }} />
                  <p className="text-3xl font-black tabular-nums">{stats?.totalPlaylists ?? 0}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {t.dashboard.playlists}
                  </p>
                </Link>
                <Link
                  href="/dashboard/songs"
                  className="p-6 transition-colors hover:bg-muted/40 border-r"
                >
                  <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: "var(--accent-activity)" }} />
                  <p className={cn("text-3xl font-black tabular-nums", (stats?.songsThisMonth ?? 0) === 0 && "text-muted-foreground")}>
                    {(stats?.songsThisMonth ?? 0) > 0 ? `+${stats!.songsThisMonth}` : "—"}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {t.dashboard.thisMonth}
                  </p>
                </Link>
                <Link
                  href="/dashboard/playlists"
                  className="p-6 transition-colors hover:bg-muted/40"
                >
                  <div className="h-0.5 w-8 rounded-full mb-3 bg-primary" />
                  <p className="text-3xl font-black tabular-nums">{stats?.upcomingPlaylists ?? 0}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {t.dashboard.upcoming}
                  </p>
                </Link>
              </div>
            </div>
          )}

          {/* Bento: Recent Songs (2/3) + Activity Feed (1/3) */}
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Recent Songs — watermark number floats behind list */}
            <div className="lg:col-span-2 relative rounded-2xl border bg-card shadow-sm overflow-hidden">
              {/* Watermark: total songs count */}
              <div
                className="pointer-events-none select-none absolute bottom-0 right-2 font-black leading-none text-foreground/[0.045]"
                aria-hidden
                style={{ fontSize: "clamp(6rem, 16vw, 12rem)" }}
              >
                {stats?.totalSongs ?? 0}
              </div>

              <div className="relative flex items-center justify-between p-5 border-b">
                <div>
                  <h3 className="font-black tracking-tighter">{t.dashboard.recentlyAdded}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.latestSongs}</p>
                </div>
                <Button variant="ghost" size="sm" asChild className="hover:bg-accent shrink-0">
                  <Link href="/dashboard/songs">
                    {t.dashboard.viewAll}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="relative space-y-1 p-4">
                {songsLoading ? (
                  <>
                    <RecentSongSkeleton />
                    <RecentSongSkeleton />
                    <RecentSongSkeleton />
                  </>
                ) : recentSongs && recentSongs.length > 0 ? (
                  recentSongs.map((song: RecentSong) => (
                    <Link
                      key={song.id}
                      href={`/dashboard/songs/${song.id}`}
                      className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50 cursor-pointer"
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
                  <div className="py-10 px-4">
                    <div className="h-0.5 w-8 rounded-full mb-4" style={{ background: "var(--accent-songs)" }} />
                    <p className="font-black tracking-tighter text-lg leading-none">{t.dashboard.noSongsYet}</p>
                    <Button variant="link" asChild className="mt-3 px-0 text-muted-foreground hover:text-foreground">
                      <Link href="/dashboard/songs">{t.dashboard.addYourFirstSong}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="p-5 border-b">
                <h3 className="font-black tracking-tighter">{t.dashboard.recentActivity}</h3>
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
