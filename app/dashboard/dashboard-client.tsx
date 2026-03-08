"use client"

import Link from "next/link"
import { Music, ListMusic, Plus, Calendar, TrendingUp, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import KeyBadge from "@/components/key-badge"
import { useTranslation } from "@/hooks/use-translation"
import { ActivityFeed, useActivityRealtime, useActivities } from "@/features/activity"
import { useDashboardStats, useRecentSongs } from "@/features/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function DashboardClient() {
  const { t } = useTranslation()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentSongs, isLoading: songsLoading } = useRecentSongs(3)
  const { data: activities } = useActivities(5)

  // Enable real-time activity updates
  useActivityRealtime()

  const hasActivities = activities && activities.length > 0
  const isNewUser = stats?.totalSongs === 0

  return (
    <div className="min-h-screen bg-background">
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
                className="transition-all hover:shadow-md bg-transparent"
              >
                <Link href="/dashboard/playlists">
                  <ListMusic className="mr-2 h-4 w-4" />
                  {t.dashboard.newPlaylist}
                </Link>
              </Button>
              <Button asChild className="transition-all hover:shadow-md">
                <Link href="/dashboard/songs">
                  <Plus className="mr-2 h-4 w-4" />
                  {t.dashboard.addSong}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {statsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold truncate">{stats?.totalSongs ?? 0}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.dashboard.totalSongs}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <ListMusic className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold truncate">{stats?.totalPlaylists ?? 0}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.dashboard.playlists}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  {isNewUser ? (
                    <Link href="/dashboard/songs" className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary animate-pulse">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-primary group-hover:underline truncate">
                          {t.dashboard.addYourFirstSong}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate uppercase tracking-wider">
                          {t.common.getStarted}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold truncate">+{stats?.songsThisMonth ?? 0}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.dashboard.thisMonth}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/dashboard/playlists"
                  className="block rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold truncate">{stats?.upcomingPlaylists ?? 0}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.dashboard.upcoming}</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className={`grid gap-6 ${hasActivities ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
            <div className={`${hasActivities ? "lg:col-span-2" : ""} rounded-lg border bg-card shadow-sm`}>
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">{t.dashboard.recentlyAdded}</h3>
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
                      className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <KeyBadge keyValue={song.key} size="md" className="group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-primary transition-colors truncate">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="rounded-full bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {song.bpm} BPM
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-xl border border-dashed">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 animate-bounce">
                      <Music className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.dashboard.noSongsYet}</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      {t.dashboard.noSongsDescription || "Start building your music library today. Add your favorite songs and lyrics to get started."}
                    </p>
                    <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                      <Link href="/dashboard/songs">
                        <Plus className="mr-2 h-5 w-5" />
                        {t.dashboard.addYourFirstSong}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {hasActivities && (
              <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">{t.dashboard.recentActivity}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.dashboard.recentActivityDescription}
                  </p>
                </div>
                <ActivityFeed />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
